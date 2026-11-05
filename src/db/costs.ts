import type { Database } from "bun:sqlite";
import type { CostWrite } from "./db.types";

/** Record what a crawl or a model call cost. Page fetches store usd 0. */
export function insertCost({ db, cost }: { db: Database; cost: CostWrite }): void {
  db.query(
    `INSERT INTO extraction_costs (
      id, recipe_id, provider, model, origin, usd, input_tokens, output_tokens, duration_ms, note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    cost.recipeId,
    cost.provider,
    cost.model,
    cost.origin,
    cost.usd,
    cost.inputTokens,
    cost.outputTokens,
    cost.durationMs,
    cost.note,
    new Date().toISOString(),
  );
}
