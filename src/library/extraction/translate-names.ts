import type { Db } from "../../db/db.types";

import { insertCost } from "../../db/costs";
import type { Ingredient } from "../../domain/domain.types";
import { translateIngredientNames } from "../extract-video";
import { describeError } from "./extraction-log";
import type { ExtractionLog } from "./extraction.types";
import { recordUsage } from "./record-cost";

/** Whether any ingredient is missing its English or Hebrew name. */
export function needsTranslation(ingredients: Ingredient[]): boolean {
  return ingredients.some((ingredient) => !ingredient.nameEn || !ingredient.nameHe);
}

/** Copy the source name into the matching language when the source is already English or Hebrew. */
export function stampKnownNames({
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

/** Ask Gemini for missing English and Hebrew names. Returns the input unchanged when the call fails. */
export async function fillTranslations({
  db,
  recipeId,
  apiKey,
  model,
  ingredients,
  timeoutMs,
  log,
}: {
  db: Db;
  recipeId: string;
  apiKey: string;
  model: string;
  ingredients: Ingredient[];
  timeoutMs: number;
  log: ExtractionLog;
}): Promise<Ingredient[]> {
  try {
    const translated = await translateIngredientNames({
      apiKey,
      model,
      names: ingredients.map((ingredient) => ingredient.name),
      timeoutMs,
      log,
    });
    await recordUsage({ db, recipeId, origin: "ingredient_translation", usage: translated.usage });

    if (translated.names.length !== ingredients.length) {
      log.warn({
        event: "translation_length_mismatch",
        fields: { sent: ingredients.length, received: translated.names.length },
      });

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
    log.error({ event: "translation_failed", fields: describeError({ error, secret: apiKey }) });
    await insertCost({
      db,
      cost: {
        recipeId,
        provider: "google",
        model,
        origin: "ingredient_translation",
        usd: 0,
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        note: "Ingredient translation failed before usage was returned.",
      },
    });

    return ingredients;
  }
}
