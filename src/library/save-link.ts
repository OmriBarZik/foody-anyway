import type { Database } from "bun:sqlite";

import { insertCost } from "../db/costs";
import type { RecipeWrite } from "../db/db.types";
import { findRecipe, findRecipeBySource, insertRecipe, updateRecipeContent } from "../db/recipes";
import type { Ingredient, RecipeView } from "../domain/domain.types";
import { measurementOf } from "./convert-units";
import { crawlDetectedLink } from "./crawl-page";
import { detectPlatform } from "./detect-platform";
import { extractYoutubeRecipe, translateIngredientNames } from "./extract-video";
import type { CrawlResult, ExtractedRecipe, ModelUsage } from "./library.types";

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
  geminiApiKey,
  geminiModel,
  householdId,
  userId,
  rawUrl,
}: {
  db: Database;
  geminiApiKey: string | null;
  geminiModel: string;
  householdId: string;
  userId: string;
  rawUrl: string;
}): Promise<RecipeView> {
  const detected = detectPlatform(rawUrl);

  if (!detected) {
    throw new SaveLinkError();
  }

  const existing = findRecipeBySource({ db, householdId, sourceUrl: detected.canonicalUrl });

  if (existing) {
    return existing;
  }

  const recipeId = crypto.randomUUID();
  const draft = emptyDraft({
    recipeId,
    householdId,
    userId,
    sourceUrl: detected.canonicalUrl,
    platform: detected.platform,
  });

  try {
    insertRecipe({ db, recipe: draft });
  } catch (error) {
    // A second save of the same link should open the first one.
    const raced = findRecipeBySource({ db, householdId, sourceUrl: detected.canonicalUrl });

    if (raced) {
      return raced;
    }

    throw error;
  }

  const crawl = await crawlDetectedLink(detected);
  recordCost({
    db,
    recipeId,
    provider: "crawler",
    model: null,
    origin: "page_fetch",
    usd: 0,
    inputTokens: null,
    outputTokens: null,
    durationMs: crawl.durationMs,
    note: crawl.note,
  });

  let chosen = crawl.recipe;
  let videoFailed = false;

  if (!isFollowable(chosen) && detected.platform === "youtube" && geminiApiKey) {
    try {
      const video = await extractYoutubeRecipe({
        apiKey: geminiApiKey,
        model: geminiModel,
        youtubeUrl: detected.canonicalUrl,
      });
      recordUsage({ db, recipeId, origin: "video_understanding", usage: video.usage });
      chosen = video.recipe ?? chosen;
      videoFailed = video.recipe === null;
    } catch (error) {
      // Keep the link even when the model request fails.
      console.error(error instanceof Error ? error.message : "Error");
      recordCost({
        db,
        recipeId,
        provider: "google",
        model: geminiModel,
        origin: "video_understanding",
        usd: 0,
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        note: "The video request failed before usage was returned.",
      });
      videoFailed = true;
    }
  }

  if (isFollowable(chosen) && geminiApiKey && needsTranslation(chosen.ingredients)) {
    chosen = {
      ...chosen,
      ingredients: await fillTranslations({
        db,
        recipeId,
        apiKey: geminiApiKey,
        model: geminiModel,
        ingredients: stampKnownNames({
          ingredients: chosen.ingredients,
          language: chosen.sourceLanguage ?? crawl.language,
        }),
      }),
    };
  }

  const finished = finishDraft({ draft, crawl, recipe: chosen, videoFailed });
  updateRecipeContent({ db, recipe: finished });
  const saved = findRecipe({ db, householdId, recipeId });

  if (!saved) {
    throw new Error("The saved video could not be reloaded. Refresh the kitchen.");
  }

  return saved;
}

function isFollowable(recipe: ExtractedRecipe | null): recipe is ExtractedRecipe {
  if (!recipe?.isRecipe) {
    return false;
  }

  return recipe.ingredients.length > 0 && recipe.steps.length > 0;
}

function needsTranslation(ingredients: Ingredient[]): boolean {
  return ingredients.some((ingredient) => !ingredient.nameEn || !ingredient.nameHe);
}

function stampKnownNames({
  ingredients,
  language,
}: {
  ingredients: Ingredient[];
  language: string | null;
}): Ingredient[] {
  return ingredients.map((ingredient) => {
    if (language === "en" && !ingredient.nameEn) {
      return { ...ingredient, nameEn: ingredient.name };
    }

    if (language === "he" && !ingredient.nameHe) {
      return { ...ingredient, nameHe: ingredient.name };
    }

    return ingredient;
  });
}

async function fillTranslations({
  db,
  recipeId,
  apiKey,
  model,
  ingredients,
}: {
  db: Database;
  recipeId: string;
  apiKey: string;
  model: string;
  ingredients: Ingredient[];
}): Promise<Ingredient[]> {
  try {
    const translated = await translateIngredientNames({
      apiKey,
      model,
      names: ingredients.map((ingredient) => ingredient.name),
    });
    recordUsage({ db, recipeId, origin: "ingredient_translation", usage: translated.usage });

    if (translated.names.length !== ingredients.length) {
      return ingredients;
    }

    return ingredients.map((ingredient, index) => {
      const name = translated.names[index];

      if (!name) {
        return ingredient;
      }

      return {
        ...ingredient,
        nameEn: name.nameEn ?? ingredient.nameEn,
        nameHe: name.nameHe ?? ingredient.nameHe,
      };
    });
  } catch (error) {
    // The recipe text is already usable. Missing translations fall back to the source name.
    console.error(error instanceof Error ? error.message : "Error");
    recordCost({
      db,
      recipeId,
      provider: "google",
      model,
      origin: "ingredient_translation",
      usd: 0,
      inputTokens: null,
      outputTokens: null,
      durationMs: 0,
      note: "Ingredient translation failed before usage was returned.",
    });

    return ingredients;
  }
}

function finishDraft({
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

function emptyDraft({
  recipeId,
  householdId,
  userId,
  sourceUrl,
  platform,
}: {
  recipeId: string;
  householdId: string;
  userId: string;
  sourceUrl: string;
  platform: RecipeWrite["platform"];
}): RecipeWrite {
  return {
    id: recipeId,
    householdId,
    savedByUserId: userId,
    sourceUrl,
    platform,
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

function recordUsage({
  db,
  recipeId,
  origin,
  usage,
}: {
  db: Database;
  recipeId: string;
  origin: string;
  usage: ModelUsage;
}): void {
  recordCost({
    db,
    recipeId,
    provider: "google",
    model: usage.model,
    origin,
    usd: usage.usd,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    durationMs: usage.durationMs,
    note: usage.note,
  });
}

function recordCost({
  db,
  recipeId,
  provider,
  model,
  origin,
  usd,
  inputTokens,
  outputTokens,
  durationMs,
  note,
}: {
  db: Database;
  recipeId: string;
  provider: string;
  model: string | null;
  origin: string;
  usd: number;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
  note: string | null;
}): void {
  insertCost({
    db,
    cost: { recipeId, provider, model, origin, usd, inputTokens, outputTokens, durationMs, note },
  });
}
