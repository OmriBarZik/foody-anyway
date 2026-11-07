import type { Db } from "../db/db.types";

import { insertAttempt } from "../db/attempts/extraction-attempts";
import { findRecipe, findRecipeBySource, insertRecipe } from "../db/recipes";
import type { RecipeView } from "../domain/domain.types";
import { detectPlatform } from "./detect-platform";
import type { GeminiSettings } from "./extraction/extraction.types";
import { emptyDraft } from "./extraction/finish-draft";
import { runExtraction } from "./extraction/run-extraction";

/** Thrown when the pasted text is not a YouTube, TikTok, Instagram, or Pinterest link. */
export class SaveLinkError extends Error {
  readonly code = "bad_link";

  constructor() {
    super("Paste a YouTube, TikTok, Instagram, or Pinterest link.");
  }
}

/**
 * Save a video link for a kitchen. Page text is tried first. YouTube falls through to Gemini
 * when the page has no followable recipe. The same link in the same kitchen is not extracted twice.
 */
export async function saveLink({
  db,
  gemini,
  householdId,
  userId,
  rawUrl,
}: {
  db: Db;
  gemini: GeminiSettings;
  householdId: string;
  userId: string;
  rawUrl: string;
}): Promise<RecipeView> {
  const detected = detectPlatform(rawUrl);

  if (!detected) {
    throw new SaveLinkError();
  }

  const existing = await findRecipeBySource({ db, householdId, sourceUrl: detected.canonicalUrl });

  if (existing) {
    return existing;
  }

  const recipeId = crypto.randomUUID();

  try {
    await insertRecipe({ db, recipe: emptyDraft({ recipeId, householdId, userId, detected }) });
  } catch (error) {
    // A second save of the same link should open the first one.
    const raced = await findRecipeBySource({ db, householdId, sourceUrl: detected.canonicalUrl });

    if (raced) {
      return raced;
    }

    throw error;
  }

  await insertAttempt({ db, attempt: { recipeId, householdId, userId, trigger: "save" } });
  await runExtraction({ db, gemini, detected, recipeId, householdId, userId, trigger: "save" });
  const saved = await findRecipe({ db, householdId, recipeId });

  if (!saved) {
    throw new Error("The saved video could not be reloaded. Refresh the kitchen.");
  }

  return saved;
}
