import type { Database } from "bun:sqlite";
import { randomToken } from "../shared/random-token";
import type { SessionRow } from "./db.types";

/** Cookie lifetime for a signed-in browser. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Start a session and return the cookie value. */
export function createSession({ db, userId }: { db: Database; userId: string }): string {
  const sessionId = randomToken();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  db.query("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
    sessionId,
    userId,
    expiresAt,
    createdAt,
  );

  return sessionId;
}

/** Look up a session that has not expired. Expired rows are removed. */
export function findSession({ db, sessionId }: { db: Database; sessionId: string }): SessionRow | null {
  const session = db.query<SessionRow, [string]>("SELECT * FROM sessions WHERE id = ?").get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expires_at < new Date().toISOString()) {
    deleteSession({ db, sessionId });

    return null;
  }

  return session;
}

/** End a session. Missing ids are ignored. */
export function deleteSession({ db, sessionId }: { db: Database; sessionId: string }): void {
  db.query("DELETE FROM sessions WHERE id = ?").run(sessionId);
}
