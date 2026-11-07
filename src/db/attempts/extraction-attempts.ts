import type { Db, HouseholdRow } from "../db.types";
import type { AttemptWrite, RetryUsage, RetryUsageRow } from "./attempts.types";

/** Record that a link is being read. The database sets created_at so clients cannot backdate it. */
export async function insertAttempt({ db, attempt }: { db: Db; attempt: AttemptWrite }): Promise<void> {
  await db
    .query(
      `INSERT INTO extraction_attempts (id, recipe_id, household_id, user_id, trigger)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(crypto.randomUUID(), attempt.recipeId, attempt.householdId, attempt.userId, attempt.trigger);
}

/**
 * Retry counts for the limits: retries by this person and this kitchen in the last minute and the last
 * 24 hours, and whether any read of this recipe began in the last `inProgressSeconds`.
 */
export async function readRetryUsage({
  db,
  recipeId,
  householdId,
  userId,
  inProgressSeconds,
}: {
  db: Db;
  recipeId: string;
  householdId: string;
  userId: string;
  inProgressSeconds: number;
}): Promise<RetryUsage> {
  const row = await db
    .query<RetryUsageRow>(
      `SELECT
        (SELECT count(*)::int FROM extraction_attempts
          WHERE user_id = ? AND trigger = 'retry' AND created_at > now() - interval '1 minute') AS user_retries_minute,
        (SELECT count(*)::int FROM extraction_attempts
          WHERE household_id = ? AND trigger = 'retry' AND created_at > now() - interval '1 minute')
          AS household_retries_minute,
        (SELECT count(*)::int FROM extraction_attempts
          WHERE user_id = ? AND trigger = 'retry' AND created_at > now() - interval '24 hours') AS user_retries_today,
        (SELECT count(*)::int FROM extraction_attempts
          WHERE household_id = ? AND trigger = 'retry' AND created_at > now() - interval '24 hours')
          AS household_retries_today,
        (SELECT count(*)::int FROM extraction_attempts
          WHERE recipe_id = ? AND created_at > now() - make_interval(secs => ?::int)) AS recent_attempts`,
    )
    .get(userId, householdId, userId, householdId, recipeId, inProgressSeconds);

  return {
    userRetriesLastMinute: row?.user_retries_minute ?? 0,
    householdRetriesLastMinute: row?.household_retries_minute ?? 0,
    userRetriesToday: row?.user_retries_today ?? 0,
    householdRetriesToday: row?.household_retries_today ?? 0,
    recentAttemptOnRecipe: (row?.recent_attempts ?? 0) > 0,
  };
}

/** Lock one kitchen's row until the transaction ends, so two retries cannot both pass the limits. */
export async function lockHousehold({ db, householdId }: { db: Db; householdId: string }): Promise<boolean> {
  const row = await db.query<HouseholdRow>("SELECT * FROM households WHERE id = ? FOR UPDATE").get(householdId);

  return row !== null;
}

/** Mark a recipe as being read again. Only rows in this kitchen that are not already ready are changed. */
export async function markRecipePending({
  db,
  householdId,
  recipeId,
}: {
  db: Db;
  householdId: string;
  recipeId: string;
}): Promise<boolean> {
  const result = await db
    .query(
      `UPDATE recipes SET extraction_status = 'pending', extraction_note = null
       WHERE id = ? AND household_id = ? AND extraction_status <> 'ready'`,
    )
    .run(recipeId, householdId);

  return result.changes === 1;
}
