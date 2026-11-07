import type { Db } from "../../db/db.types";

import { findRecipe } from "../../db/recipes";
import { detectPlatform } from "../detect-platform";
import type { GeminiSettings } from "../extraction/extraction.types";
import { runExtraction } from "../extraction/run-extraction";
import { claimRetry } from "./claim-retry";
import type { RetryOutcome } from "./retry.types";

/**
 * Read a saved video again, for a recipe in this kitchen that is not ready yet.
 * Refuses when a limit is reached. Only the stored link is fetched; nothing from the request is.
 */
export async function retryRecipe({
  db,
  gemini,
  householdId,
  userId,
  recipeId,
}: {
  db: Db;
  gemini: GeminiSettings;
  householdId: string;
  userId: string;
  recipeId: string;
}): Promise<RetryOutcome> {
  const claim = await claimRetry({ db, householdId, userId, recipeId });

  if (claim.status === "refused") {
    return claim;
  }

  // The link was checked when it was saved. Checking again keeps a bad row from being fetched.
  const detected = detectPlatform(claim.recipe.sourceUrl);

  if (!detected) {
    throw new Error("The saved link is no longer a supported video link.");
  }

  await runExtraction({ db, gemini, detected, recipeId, householdId, userId, trigger: "retry" });
  const recipe = await findRecipe({ db, householdId, recipeId });

  if (!recipe) {
    return { status: "refused", code: "not_found" };
  }

  return { status: "done", recipe };
}
