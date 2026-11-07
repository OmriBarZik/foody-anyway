import type { RecipeWrite } from "../../db/db.types";
import { measurementOf } from "../convert-units";
import type { CrawlResult, DetectedLink, ExtractedRecipe } from "../library.types";

/** A recipe with ingredients and steps, good enough to cook from. */
export function isFollowable(recipe: ExtractedRecipe | null): recipe is ExtractedRecipe {
  if (!recipe?.isRecipe) {
    return false;
  }

  return recipe.ingredients.length > 0 && recipe.steps.length > 0;
}

/** A pending row with only the link filled in. Extraction fills the rest. */
export function emptyDraft({
  recipeId,
  householdId,
  userId,
  detected,
}: {
  recipeId: string;
  householdId: string;
  userId: string;
  detected: DetectedLink;
}): RecipeWrite {
  return {
    id: recipeId,
    householdId,
    savedByUserId: userId,
    sourceUrl: detected.canonicalUrl,
    platform: detected.platform,
    thumbnailUrl: null,
    dishImageUrl: null,
    title: null,
    servings: null,
    cookTime: null,
    ingredients: [],
    steps: [],
    sourceLanguage: null,
    sourceMeasurement: null,
    extractionStatus: "pending",
    extractionNote: null,
  };
}

/** The row to store once the page and the model have both had their turn. */
export function finishDraft({
  draft,
  crawl,
  recipe,
  videoFailed,
}: {
  draft: RecipeWrite;
  crawl: CrawlResult;
  recipe: ExtractedRecipe | null;
  videoFailed: boolean;
}): RecipeWrite {
  const notARecipe = recipe !== null && !recipe.isRecipe;
  const followable = isFollowable(recipe);
  const status = followable ? "ready" : videoFailed ? "failed" : "needs_review";
  const note = followable ? null : videoFailed ? "video_failed" : notARecipe ? "not_a_recipe" : crawl.note;

  return {
    ...draft,
    thumbnailUrl: crawl.thumbnailUrl,
    dishImageUrl: crawl.dishImageUrl,
    title: recipe?.title ?? crawl.title,
    servings: recipe?.servings ?? null,
    cookTime: recipe?.cookTime ?? null,
    ingredients: recipe?.ingredients ?? [],
    steps: recipe?.steps ?? [],
    sourceLanguage: recipe?.sourceLanguage ?? crawl.language,
    sourceMeasurement: recipe?.sourceMeasurement ?? (recipe ? measurementOf(recipe.ingredients) : null),
    extractionStatus: status,
    extractionNote: note,
  };
}
