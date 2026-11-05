import type { Database } from "bun:sqlite";
import type { ExtractionStatus, Ingredient, RecipeStep, RecipeView, VideoPlatform } from "../domain/domain.types";
import { isRecord } from "../shared/is-record";
import type { RecipeListRow, RecipeWrite } from "./db.types";

const RECIPE_SELECT = `
  SELECT recipes.*, users.name AS saved_by_name
  FROM recipes
  JOIN users ON users.id = recipes.saved_by_user_id
`;

/** Recipes in one kitchen, newest first. */
export function listRecipes({ db, householdId }: { db: Database; householdId: string }): RecipeView[] {
  const rows = db
    .query<RecipeListRow, [string]>(`${RECIPE_SELECT} WHERE recipes.household_id = ? ORDER BY recipes.created_at DESC`)
    .all(householdId);

  return rows.map((row) => toRecipeView(row));
}

/** One recipe, only if it belongs to this kitchen. */
export function findRecipe({
  db,
  householdId,
  recipeId,
}: {
  db: Database;
  householdId: string;
  recipeId: string;
}): RecipeView | null {
  const row = db
    .query<RecipeListRow, [string, string]>(`${RECIPE_SELECT} WHERE recipes.household_id = ? AND recipes.id = ?`)
    .get(householdId, recipeId);

  if (!row) {
    return null;
  }

  return toRecipeView(row);
}

/** An earlier save of the same link in this kitchen. */
export function findRecipeBySource({
  db,
  householdId,
  sourceUrl,
}: {
  db: Database;
  householdId: string;
  sourceUrl: string;
}): RecipeView | null {
  const row = db
    .query<RecipeListRow, [string, string]>(
      `${RECIPE_SELECT} WHERE recipes.household_id = ? AND recipes.source_url = ?`,
    )
    .get(householdId, sourceUrl);

  if (!row) {
    return null;
  }

  return toRecipeView(row);
}

/** Insert a recipe that extraction will fill in. */
export function insertRecipe({ db, recipe }: { db: Database; recipe: RecipeWrite }): void {
  db.query(
    `INSERT INTO recipes (
      id, household_id, saved_by_user_id, source_url, platform, thumbnail_url, dish_image_url,
      title, servings, cook_time, ingredients_json, steps_json, source_language, source_measurement,
      extraction_status, extraction_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    recipe.id,
    recipe.householdId,
    recipe.savedByUserId,
    recipe.sourceUrl,
    recipe.platform,
    recipe.thumbnailUrl,
    recipe.dishImageUrl,
    recipe.title,
    recipe.servings,
    recipe.cookTime,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.steps),
    recipe.sourceLanguage,
    recipe.sourceMeasurement,
    recipe.extractionStatus,
    recipe.extractionNote,
    new Date().toISOString(),
  );
}

/** Replace the parsed fields after a crawl or a model call. */
export function updateRecipeContent({ db, recipe }: { db: Database; recipe: RecipeWrite }): void {
  db.query(
    `UPDATE recipes SET
      thumbnail_url = ?,
      dish_image_url = ?,
      title = ?,
      servings = ?,
      cook_time = ?,
      ingredients_json = ?,
      steps_json = ?,
      source_language = ?,
      source_measurement = ?,
      extraction_status = ?,
      extraction_note = ?
    WHERE id = ? AND household_id = ?`,
  ).run(
    recipe.thumbnailUrl,
    recipe.dishImageUrl,
    recipe.title,
    recipe.servings,
    recipe.cookTime,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.steps),
    recipe.sourceLanguage,
    recipe.sourceMeasurement,
    recipe.extractionStatus,
    recipe.extractionNote,
    recipe.id,
    recipe.householdId,
  );
}

/** Map a stored row into the shape the app renders. */
export function toRecipeView(row: RecipeListRow): RecipeView {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    platform: asPlatform(row.platform),
    thumbnailUrl: row.thumbnail_url,
    dishImageUrl: row.dish_image_url,
    title: row.title,
    servings: row.servings,
    cookTime: row.cook_time,
    ingredients: parseIngredients(row.ingredients_json),
    steps: parseSteps(row.steps_json),
    sourceLanguage: row.source_language,
    sourceMeasurement: asMeasurement(row.source_measurement),
    extractionStatus: asStatus(row.extraction_status),
    extractionNote: row.extraction_note,
    savedByName: row.saved_by_name,
    createdAt: row.created_at,
  };
}

function asPlatform(value: string): VideoPlatform {
  if (value === "youtube" || value === "tiktok" || value === "instagram" || value === "pinterest") {
    return value;
  }

  return "youtube";
}

function asStatus(value: string): ExtractionStatus {
  if (value === "pending" || value === "ready" || value === "needs_review" || value === "failed") {
    return value;
  }

  return "failed";
}

function asMeasurement(value: string | null): RecipeView["sourceMeasurement"] {
  if (value === "metric" || value === "imperial" || value === "mixed" || value === "none") {
    return value;
  }

  return null;
}

function parseIngredients(json: string): Ingredient[] {
  const parsed = parseJson(json);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((entry) => {
    const ingredient = asIngredient(entry);

    return ingredient ? [ingredient] : [];
  });
}

function parseSteps(json: string): RecipeStep[] {
  const parsed = parseJson(json);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.text !== "string") {
      return [];
    }

    const order = typeof entry.order === "number" ? entry.order : 0;

    return [{ order, text: entry.text }];
  });
}

function asIngredient(value: unknown): Ingredient | null {
  if (!isRecord(value) || typeof value.name !== "string" || value.name.trim() === "") {
    return null;
  }

  const system =
    value.system === "metric" || value.system === "imperial" || value.system === "none" ? value.system : "none";

  return {
    name: value.name,
    nameEn: typeof value.nameEn === "string" ? value.nameEn : null,
    nameHe: typeof value.nameHe === "string" ? value.nameHe : null,
    amount: typeof value.amount === "number" && Number.isFinite(value.amount) ? value.amount : null,
    unit: typeof value.unit === "string" ? value.unit : null,
    system,
    note: typeof value.note === "string" ? value.note : null,
  };
}

function parseJson(json: string): unknown {
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}
