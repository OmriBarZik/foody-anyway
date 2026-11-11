import { isRecord } from "../../shared/is-record";
import type { ManualIngredientInput, ManualRecipeInput } from "./manual.types";

const MAX_TEXT = 200;
const MAX_STEP = 2000;
const MAX_LINES = 80;

/** Check a hand-written recipe body. Null when it has no title, or nothing to cook from. */
export function readManualRecipe(body: unknown): ManualRecipeInput | null {
  if (!isRecord(body)) {
    return null;
  }

  const title = shortText({ value: body.title, max: MAX_TEXT });
  const ingredients = readIngredients(body.ingredients);
  const steps = readSteps(body.steps);

  if (!title || !ingredients || !steps) {
    return null;
  }

  if (ingredients.length === 0 && steps.length === 0) {
    return null;
  }

  return {
    title,
    cookTime: shortText({ value: body.cookTime, max: MAX_TEXT }),
    servings: shortText({ value: body.servings, max: MAX_TEXT }),
    sourceNote: shortText({ value: body.sourceNote, max: MAX_TEXT }),
    ingredients,
    steps,
  };
}

function readIngredients(value: unknown): ManualIngredientInput[] | null {
  if (!Array.isArray(value) || value.length > MAX_LINES) {
    return null;
  }

  const lines: ManualIngredientInput[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }

    const name = shortText({ value: entry.name, max: MAX_TEXT });

    // Empty rows are left behind by the form; skip them instead of refusing the recipe.
    if (!name) {
      continue;
    }

    lines.push({ name, amount: shortText({ value: entry.amount, max: MAX_TEXT }) ?? "" });
  }

  return lines;
}

function readSteps(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_LINES) {
    return null;
  }

  return value.flatMap((entry) => {
    const text = shortText({ value: entry, max: MAX_STEP });

    return text ? [text] : [];
  });
}

function shortText({ value, max }: { value: unknown; max: number }): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, max);
}
