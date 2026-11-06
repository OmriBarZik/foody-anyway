import type { Db } from "../db/db.types";
import type { FoodyAuth } from "../auth/create-foody-auth";
import { jsonError } from "../http/json-error";
import { readJson } from "../http/request";
import { requireUser } from "../http/require-user";
import { readProfile, saveProfile } from "./profile";
import { readProfileDraft } from "./read-profile";

/** The signed-in person's food preferences. */
export async function getProfile({
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

  return Response.json(await readProfile({ db, userId: current.user.id }));
}

/** Replace allergies, diet, dislikes, time, budget, and interests. */
export async function putProfile({
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

  const profile = readProfileDraft(await readJson(request));

  if (!profile) {
    return jsonError({ status: 400, code: "bad_profile" });
  }

  return Response.json(await saveProfile({ db, userId: current.user.id, profile }));
}
