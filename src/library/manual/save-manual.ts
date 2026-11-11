import type { Db } from "../../db/db.types";

import { findRecipe, insertRecipe } from "../../db/recipes";
import type { Ingredient, RecipeView } from "../../domain/domain.types";
import { measurementOf } from "../convert-units";
import { parseIngredientLine } from "../parse-ingredient-line";
import type { ManualIngredientInput, ManualRecipeInput } from "./manual.types";

/**
 * Store a recipe someone typed in. It is ready at once: nothing is read from a page or a model,
 * and the source URL is a placeholder that only keeps the per-kitchen unique index happy.
 */
export async function saveManualRecipe({
  db,
  householdId,
  userId,
  input,
}: {
  db: Db;
  householdId: string;
  userId: string;
  input: ManualRecipeInput;
}): Promise<RecipeView> {
  const recipeId = crypto.randomUUID();
  const ingredients = input.ingredients.flatMap((line) => toIngredient(line));

  await insertRecipe({
    db,
    recipe: {
      id: recipeId,
      householdId,
      savedByUserId: userId,
      sourceUrl: `manual:${recipeId}`,
      platform: "manual",
      thumbnailUrl: null,
      dishImageUrl: null,
      title: input.title,
      servings: input.servings,
      cookTime: input.cookTime,
      ingredients,
      steps: input.steps.map((text, index) => ({ order: index + 1, text })),
      sourceLanguage: null,
      sourceMeasurement: measurementOf(ingredients),
      extractionStatus: "ready",
      extractionNote: null,
      sourceNote: input.sourceNote,
    },
  });

  const saved = await findRecipe({ db, householdId, recipeId });

  if (!saved) {
    throw new Error("The new recipe could not be reloaded. Refresh the kitchen.");
  }

  return saved;
}

function toIngredient(line: ManualIngredientInput): Ingredient[] {
  const parsed = parseIngredientLine(`${line.amount} ${line.name}`.trim());

  return parsed ? [parsed] : [];
}
