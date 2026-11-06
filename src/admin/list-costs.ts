import type { Db } from "../db/db.types";
import type { CostJoinRow, CostReport, CostRowView } from "./admin.types";

/** All extraction costs. This is the bill for running the reader, not a per-kitchen view. */
export async function listCosts({ db }: { db: Db }): Promise<CostReport> {
  const rows = await db
    .query<CostJoinRow>(
      `SELECT extraction_costs.id, extraction_costs.recipe_id, recipes.title AS recipe_title,
        extraction_costs.provider, extraction_costs.model, extraction_costs.origin, extraction_costs.usd,
        extraction_costs.input_tokens, extraction_costs.output_tokens, extraction_costs.duration_ms,
        extraction_costs.created_at
      FROM extraction_costs
      JOIN recipes ON recipes.id = extraction_costs.recipe_id
      ORDER BY extraction_costs.created_at DESC`,
    )
    .all();
  const views = rows.map(toView);
  const totalUsd = views.reduce((sum, row) => sum + row.usd, 0);

  return { totalUsd, rows: views };
}

function toView(row: CostJoinRow): CostRowView {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeTitle: row.recipe_title,
    provider: row.provider,
    model: row.model,
    origin: row.origin,
    usd: row.usd,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}
