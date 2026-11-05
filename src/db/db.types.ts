import type { Ingredient, RecipeStep } from "../domain/domain.types";

/** A row in households. */
export type HouseholdRow = {
  id: string;
  name: string;
  created_at: string;
};

/** A row in memberships. */
export type MembershipRow = {
  user_id: string;
  household_id: string;
  role: string;
  created_at: string;
};

/** A row in invites. */
export type InviteRow = {
  id: string;
  household_id: string;
  token: string;
  created_by_user_id: string;
  created_at: string;
  expires_at: string;
};

/** A row in recipes. JSON columns are still text here. */
export type RecipeRow = {
  id: string;
  household_id: string;
  saved_by_user_id: string;
  source_url: string;
  platform: string;
  thumbnail_url: string | null;
  dish_image_url: string | null;
  title: string | null;
  servings: string | null;
  cook_time: string | null;
  ingredients_json: string;
  steps_json: string;
  source_language: string | null;
  source_measurement: string | null;
  extraction_status: string;
  extraction_note: string | null;
  created_at: string;
};

/** A recipe row plus the name of the person who saved it. */
export type RecipeListRow = RecipeRow & {
  saved_by_name: string;
};

/** Fields written when a recipe is inserted or finished. */
export type RecipeWrite = {
  id: string;
  householdId: string;
  savedByUserId: string;
  sourceUrl: string;
  platform: string;
  thumbnailUrl: string | null;
  dishImageUrl: string | null;
  title: string | null;
  servings: string | null;
  cookTime: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  sourceLanguage: string | null;
  sourceMeasurement: string | null;
  extractionStatus: string;
  extractionNote: string | null;
};

/** A row in extraction_costs. */
export type ExtractionCostRow = {
  id: string;
  recipe_id: string;
  provider: string;
  model: string | null;
  origin: string;
  usd: number;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number;
  note: string | null;
  created_at: string;
};

/** What to store after a crawl or a model call. */
export type CostWrite = {
  recipeId: string;
  provider: string;
  model: string | null;
  origin: string;
  usd: number;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
  note: string | null;
};

/** Why an invite could not move someone into a kitchen. */
export type AcceptInviteStatus = "joined" | "already" | "missing" | "conflict";
