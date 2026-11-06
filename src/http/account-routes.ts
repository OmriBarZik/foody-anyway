import type { Db } from "../db/db.types";

import type { FoodyAuth } from "../auth/create-foody-auth";
import type { AppConfig } from "../config/config.types";
import { acceptInvite, createInvite, findHouseholdForUser, findInvitePreview } from "../db/households";
import type { Locale, MeasurementSystem } from "../domain/domain.types";
import { isRecord } from "../shared/is-record";
import { jsonError } from "./json-error";
import { pathParam, readJson } from "./request";
import { requireUser } from "./require-user";
import { toUserView } from "./user-view";

/** The signed-in account. */
export async function getMe({ request, db, auth }: { request: Request; db: Db; auth: FoodyAuth }): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(toUserView(current));
}

/** Update language or measurement for the signed-in person. */
export async function patchMe({ request, db, auth }: { request: Request; db: Db; auth: FoodyAuth }): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const body = await readJson(request);

  if (!isRecord(body)) {
    return jsonError({ status: 400, code: "settings" });
  }

  const locale = readLocale(body);
  const measurement = readMeasurement(body);

  if (locale instanceof Response) {
    return locale;
  }

  if (measurement instanceof Response) {
    return measurement;
  }

  if (locale || measurement) {
    await auth.api.updateUser({
      body: {
        ...(locale ? { locale } : {}),
        ...(measurement ? { measurement } : {}),
      },
      headers: request.headers,
    });
  }

  const refreshed = await requireUser({ auth, db, request });

  if (refreshed instanceof Response) {
    return refreshed;
  }

  return Response.json(toUserView(refreshed));
}

/** Create an invite link for this kitchen. */
export async function postInvite({
  request,
  db,
  auth,
  config,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
  config: AppConfig;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(
    await createInvite({
      db,
      householdId: current.household.id,
      userId: current.user.id,
      appOrigin: config.appOrigin,
    }),
  );
}

/** Kitchen name for an invite, without joining it. */
export async function getInvite({ request, db }: { request: Request; db: Db }): Promise<Response> {
  const token = pathParam({ request, index: 3 });
  const preview = token ? await findInvitePreview({ db, token }) : null;

  if (!preview) {
    return jsonError({ status: 404, code: "invite_missing" });
  }

  return Response.json(preview);
}

/** Join the invited kitchen when this account's own kitchen is still empty. */
export async function postAcceptInvite({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const body = await readJson(request);
  const token = isRecord(body) && typeof body.token === "string" ? body.token : null;

  if (!token) {
    return jsonError({ status: 400, code: "invite_missing" });
  }

  const status = await acceptInvite({ db, userId: current.user.id, token });

  if (status === "missing") {
    return jsonError({ status: 404, code: "invite_missing" });
  }

  if (status === "conflict") {
    return jsonError({ status: 409, code: "invite_conflict" });
  }

  const household = await findHouseholdForUser({ db, userId: current.user.id });

  if (!household) {
    return jsonError({ status: 404, code: "invite_missing" });
  }

  return Response.json({ status, user: toUserView({ user: current.user, household }) });
}

function readLocale(body: Record<string, unknown>): Locale | null | Response {
  if (!("locale" in body)) {
    return null;
  }

  if (body.locale === "en" || body.locale === "he") {
    return body.locale;
  }

  return jsonError({ status: 400, code: "settings" });
}

function readMeasurement(body: Record<string, unknown>): MeasurementSystem | null | Response {
  if (!("measurement" in body)) {
    return null;
  }

  if (body.measurement === "metric" || body.measurement === "imperial") {
    return body.measurement;
  }

  return jsonError({ status: 400, code: "settings" });
}
