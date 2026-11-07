import type { Db } from "../../db/db.types";

import { insertAttempt, lockHousehold, markRecipePending, readRetryUsage } from "../../db/attempts/extraction-attempts";
import { findRecipe } from "../../db/recipes";
import { createExtractionLog } from "../extraction/extraction-log";
import type { RetryClaim, RetryRefusalCode } from "./retry.types";

/** Retries allowed on one recipe, ever. */
export const RETRIES_PER_RECIPE = 3;

/** Retries one person may start in 24 hours, across every recipe. */
export const RETRIES_PER_USER_PER_DAY = 10;

/** Retries one kitchen may start in 24 hours, across every member. */
export const RETRIES_PER_HOUSEHOLD_PER_DAY = 20;

/** A read that began this recently may still be running, so a new one waits. Longer than the 60s route limit. */
export const IN_PROGRESS_SECONDS = 120;

/**
 * Check every limit and, if they pass, record the attempt and mark the recipe pending, all in one transaction.
 * The kitchen row is locked first, so parallel requests from one kitchen are checked one at a time.
 */
export async function claimRetry({
  db,
  householdId,
  userId,
  recipeId,
}: {
  db: Db;
  householdId: string;
  userId: string;
  recipeId: string;
}): Promise<RetryClaim> {
  const log = createExtractionLog({ base: { recipeId, householdId, userId, trigger: "retry" } });

  const claim = await db.transaction(async (tx): Promise<RetryClaim> => {
    const refuse = (code: RetryRefusalCode): RetryClaim => ({ status: "refused", code });

    if (!(await lockHousehold({ db: tx, householdId }))) {
      return refuse("not_found");
    }

    const recipe = await findRecipe({ db: tx, householdId, recipeId });

    if (!recipe) {
      return refuse("not_found");
    }

    if (recipe.extractionStatus === "ready") {
      return refuse("already_ready");
    }

    const usage = await readRetryUsage({
      db: tx,
      recipeId,
      householdId,
      userId,
      inProgressSeconds: IN_PROGRESS_SECONDS,
    });
    log.info({ event: "retry_usage", fields: usage });

    if (usage.recentAttemptOnRecipe) {
      return refuse("retry_in_progress");
    }

    if (usage.recipeRetries >= RETRIES_PER_RECIPE) {
      return refuse("retry_limit_recipe");
    }

    if (
      usage.userRetriesToday >= RETRIES_PER_USER_PER_DAY ||
      usage.householdRetriesToday >= RETRIES_PER_HOUSEHOLD_PER_DAY
    ) {
      return refuse("retry_limit_daily");
    }

    await insertAttempt({ db: tx, attempt: { recipeId, householdId, userId, trigger: "retry" } });

    if (!(await markRecipePending({ db: tx, householdId, recipeId }))) {
      throw new Error("The recipe changed while the retry was starting. Try again.");
    }

    return { status: "claimed", recipe };
  });

  if (claim.status === "refused") {
    log.warn({ event: "retry_refused", fields: { code: claim.code } });
  }

  return claim;
}
