import type { Ingredient, RecipeStep } from "../domain/domain.types";
import { isRecord } from "../shared/is-record";
import { measurementOf } from "./convert-units";
import type { ExtractedRecipe, RecipeDocument } from "./library.types";
import { parseIngredientLine } from "./parse-ingredient-line";

/** Find the first schema.org Recipe in a page, including pages that nest it under @graph. */
export function findRecipeInHtml({ html, language }: { html: string; language: string | null }): RecipeDocument | null {
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = pattern.exec(html);

  while (match) {
    const parsed = parseEmbeddedJson(match[1] ?? "");
    const found = parsed ? walkForRecipe({ node: parsed, language, depth: 0 }) : null;

    if (found) {
      return found;
    }

    match = pattern.exec(html);
  }

  return null;
}

function walkForRecipe({
  node,
  language,
  depth,
}: {
  node: unknown;
  language: string | null;
  depth: number;
}): RecipeDocument | null {
  if (depth > 8) {
    return null;
  }

  if (Array.isArray(node)) {
    for (const entry of node) {
      const found = walkForRecipe({ node: entry, language, depth: depth + 1 });

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!isRecord(node)) {
    return null;
  }

  if (hasType(node, "Recipe")) {
    return recipeFromNode({ node, language });
  }

  if (node["@graph"]) {
    return walkForRecipe({ node: node["@graph"], language, depth: depth + 1 });
  }

  return null;
}

function recipeFromNode({
  node,
  language,
}: {
  node: Record<string, unknown>;
  language: string | null;
}): RecipeDocument | null {
  const ingredients = readIngredients(node.recipeIngredient);
  const steps = readSteps(node.recipeInstructions);

  if (ingredients.length === 0 && steps.length === 0) {
    return null;
  }

  const title = readText(node.name);
  const recipe: ExtractedRecipe = {
    isRecipe: true,
    title,
    servings: readYield(node.recipeYield),
    cookTime: readDuration(node.totalTime) ?? readDuration(node.cookTime),
    sourceLanguage: language,
    sourceMeasurement: measurementOf(ingredients),
    ingredients,
    steps,
  };

  return { recipe, imageUrl: readImage(node.image) };
}

function readIngredients(value: unknown): Ingredient[] {
  return readLines(value).flatMap((line) => {
    const ingredient = parseIngredientLine(line);

    return ingredient ? [ingredient] : [];
  });
}

function readSteps(value: unknown): RecipeStep[] {
  return readInstructionTexts(value).map((text, index) => {
    return { order: index + 1, text };
  });
}

function readInstructionTexts(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  if (!Array.isArray(value)) {
    if (!isRecord(value)) {
      return [];
    }

    if (hasType(value, "HowToSection")) {
      return readInstructionTexts(value.itemListElement);
    }

    const text = readText(value.text);

    if (!text) {
      return [];
    }

    return [text];
  }

  return value.flatMap((entry) => readInstructionTexts(entry));
}

function readLines(value: unknown): string[] {
  if (typeof value === "string") {
    return [value.trim()].filter((line) => line.length > 0);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry === "string") {
      return entry.trim() ? [entry.trim()] : [];
    }

    if (isRecord(entry)) {
      const text = readText(entry.text) ?? readText(entry.name);

      return text ? [text] : [];
    }

    return [];
  });
}

function readYield(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === "string" || typeof entry === "number");

    return first === undefined ? null : String(first);
  }

  return null;
}

function readDuration(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(value);

  if (!match) {
    return value;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const total = hours * 60 + minutes;

  if (total <= 0) {
    return value;
  }

  return `${total} min`;
}

function readImage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const image = readImage(entry);

      if (image) {
        return image;
      }
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  return readText(value.url);
}

function readText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function hasType(node: Record<string, unknown>, expected: string): boolean {
  const value = node["@type"];

  if (typeof value === "string") {
    return value === expected;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((entry) => entry === expected);
}

function parseEmbeddedJson(raw: string): unknown {
  try {
    return JSON.parse(raw.trim()) as unknown;
  } catch {
    return null;
  }
}
