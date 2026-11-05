import type { Ingredient } from "../../domain/domain.types";
import { isRecord } from "../../shared/is-record";
import type { ExtractedRecipe, TranslatedIngredientName } from "../library.types";
import { measurementOf } from "../convert-units";

/** Turn model JSON into a recipe. Returns null when the body is not the shape we asked for. */
export function recipeFromModelJson(payload: unknown): ExtractedRecipe | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (payload.isRecipe === false) {
    return emptyRecipe(false);
  }

  if (payload.isRecipe !== true) {
    return null;
  }

  const ingredients = readIngredients(payload.ingredients);
  const steps = readSteps(payload.steps);

  return {
    isRecipe: true,
    title: readString(payload.title),
    servings: readString(payload.servings),
    cookTime: readString(payload.cookTime),
    sourceLanguage: readString(payload.sourceLanguage),
    sourceMeasurement: readMeasurement(payload.sourceMeasurement) ?? measurementOf(ingredients),
    ingredients,
    steps,
  };
}

/** Names in the same order they were sent. Empty when the model changed the length. */
export function namesFromModelJson({
  payload,
  count,
}: {
  payload: unknown;
  count: number;
}): TranslatedIngredientName[] {
  if (!isRecord(payload) || !Array.isArray(payload.names) || payload.names.length !== count) {
    return [];
  }

  return payload.names.map((entry) => {
    if (!isRecord(entry)) {
      return { nameEn: null, nameHe: null };
    }

    return { nameEn: readString(entry.nameEn), nameHe: readString(entry.nameHe) };
  });
}

function readIngredients(value: unknown): Ingredient[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    const ingredient = readIngredient(entry);

    return ingredient ? [ingredient] : [];
  });
}

function readIngredient(value: unknown): Ingredient | null {
  if (!isRecord(value) || typeof value.name !== "string" || value.name.trim() === "") {
    return null;
  }

  const system =
    value.system === "metric" || value.system === "imperial" || value.system === "none" ? value.system : "none";

  return {
    name: value.name.trim(),
    nameEn: readString(value.nameEn),
    nameHe: readString(value.nameHe),
    amount: typeof value.amount === "number" && Number.isFinite(value.amount) ? value.amount : null,
    unit: readString(value.unit),
    system,
    note: readString(value.note),
  };
}

function readSteps(value: unknown): ExtractedRecipe["steps"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    const text = typeof entry === "string" ? entry.trim() : "";

    if (!text) {
      return [];
    }

    return [{ order: index + 1, text }];
  });
}

function readMeasurement(value: unknown): ExtractedRecipe["sourceMeasurement"] {
  if (value === "metric" || value === "imperial" || value === "mixed" || value === "none") {
    return value;
  }

  return null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function emptyRecipe(isRecipe: boolean): ExtractedRecipe {
  return {
    isRecipe,
    title: null,
    servings: null,
    cookTime: null,
    sourceLanguage: null,
    sourceMeasurement: null,
    ingredients: [],
    steps: [],
  };
}
