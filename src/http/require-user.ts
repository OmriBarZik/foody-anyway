import type { Database } from "bun:sqlite";

import type { CurrentUser } from "../auth/auth.types";
import { currentUser } from "../auth/current-user";
import type { FoodyAuth } from "../auth/create-foody-auth";
import { jsonError } from "./json-error";

/** The signed-in person, or a 401 response when the session cookie is missing. */
export async function requireUser({
  auth,
  db,
  request,
}: {
  auth: FoodyAuth;
  db: Database;
  request: Request;
}): Promise<CurrentUser | Response> {
  const found = await currentUser({ auth, db, request });

  if (!found) {
    return jsonError({ status: 401, code: "sign_in" });
  }

  return found;
}
