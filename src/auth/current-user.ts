import type { Database } from "bun:sqlite";

import { findHouseholdForUser } from "../db/households";
import { findSession } from "../db/sessions";
import { findUserById } from "../db/users";
import type { CurrentUser } from "./auth.types";
import { readCookie, SESSION_COOKIE } from "./session-cookie";

/** The person behind the session cookie, or null when they are signed out. */
export function currentUser({ db, request }: { db: Database; request: Request }): CurrentUser | null {
  const sessionId = readCookie({ request, name: SESSION_COOKIE });

  if (!sessionId) {
    return null;
  }

  const session = findSession({ db, sessionId });

  if (!session) {
    return null;
  }

  const user = findUserById({ db, userId: session.user_id });
  const household = user ? findHouseholdForUser({ db, userId: user.id }) : null;

  if (!user || !household) {
    return null;
  }

  return { user, household };
}
