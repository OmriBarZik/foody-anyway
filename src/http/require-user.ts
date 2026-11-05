import type { Database } from "bun:sqlite";

import type { CurrentUser } from "../auth/auth.types";
import { currentUser } from "../auth/current-user";
import { jsonError } from "./json-error";

/** The signed-in person, or a 401 response when the cookie is missing. */
export function requireUser({ db, request }: { db: Database; request: Request }): CurrentUser | Response {
  const found = currentUser({ db, request });

  if (!found) {
    return jsonError({ status: 401, code: "sign_in" });
  }

  return found;
}
