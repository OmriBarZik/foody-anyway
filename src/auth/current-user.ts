import type { Database } from "bun:sqlite";

import { createHouseholdForUser, findHouseholdForUser } from "../db/households";
import type { CurrentUser } from "./auth.types";
import type { FoodyAuth } from "./create-foody-auth";

/** The person behind Better Auth's session cookie, or null when they are signed out. */
export async function currentUser({
  auth,
  db,
  request,
}: {
  auth: FoodyAuth;
  db: Database;
  request: Request;
}): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return null;
  }

  const existing = findHouseholdForUser({ db, userId: session.user.id });

  if (existing) {
    return { user: session.user, household: existing };
  }

  const name = session.user.name.trim() || "Kitchen";
  const household = createHouseholdForUser({ db, userId: session.user.id, name });

  return { user: session.user, household };
}
