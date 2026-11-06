/** One extraction cost, with the recipe title when the recipe is still saved. */
export type CostRowView = {
  id: string;
  recipeId: string;
  recipeTitle: string | null;
  provider: string;
  model: string | null;
  origin: string;
  usd: number;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
  createdAt: string;
};

/** Every recorded extraction cost, newest first, plus the dollar total. */
export type CostReport = {
  totalUsd: number;
  rows: CostRowView[];
};

/** A cost row joined to its recipe title. */
export type CostJoinRow = {
  id: string;
  recipe_id: string;
  recipe_title: string | null;
  provider: string;
  model: string | null;
  origin: string;
  usd: number;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number;
  created_at: string;
};
