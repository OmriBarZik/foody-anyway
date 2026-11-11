import type { Db } from "../db/db.types";

import type { FoodyAuth } from "../auth/create-foody-auth";
import { jsonError } from "../http/json-error";
import { pathParam, readJson } from "../http/request";
import { requireUser } from "../http/require-user";
import { toUserView } from "../http/user-view";
import { isRecord } from "../shared/is-record";
import { listMembers } from "./list-members";
import { removeMember } from "./remove-member";
import { KITCHEN_NAME_MAX_LENGTH, renameHousehold } from "./rename-household";

/** The people who share the signed-in kitchen. */
export async function getMembers({
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

  return Response.json(await listMembers({ db, householdId: current.household.id }));
}

/** Rename the signed-in kitchen. Only its owner may. */
export async function patchHousehold({
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
  const name = isRecord(body) && typeof body.name === "string" ? body.name.trim() : "";

  if (!name || name.length > KITCHEN_NAME_MAX_LENGTH) {
    return jsonError({ status: 400, code: "kitchen_name" });
  }

  const renamed = await renameHousehold({ db, householdId: current.household.id, userId: current.user.id, name });

  if (!renamed) {
    return jsonError({ status: 403, code: "not_owner" });
  }

  return Response.json(toUserView({ user: current.user, household: { ...current.household, name } }));
}

/** Remove one person from the signed-in kitchen, or let the signed-in person leave it. */
export async function deleteMember({
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

  const targetUserId = pathParam({ request, index: 3 });

  if (!targetUserId) {
    return jsonError({ status: 404, code: "member_missing" });
  }

  const status = await removeMember({
    db,
    householdId: current.household.id,
    actorUserId: current.user.id,
    targetUserId,
  });

  if (status === "missing") {
    return jsonError({ status: 404, code: "member_missing" });
  }

  if (status === "forbidden") {
    return jsonError({ status: 403, code: "not_owner" });
  }

  // A person who left lands in a fresh kitchen of their own, so send back who they are now.
  const refreshed = await requireUser({ auth, db, request });

  if (refreshed instanceof Response) {
    return refreshed;
  }

  return Response.json(toUserView(refreshed));
}
