import type { Db } from "../../db/db.types";

import { insertCost } from "../../db/costs";
import type { ModelUsage } from "../library.types";

/** Store one model call's tokens and estimated USD. */
export async function recordUsage({
  db,
  recipeId,
  origin,
  usage,
}: {
  db: Db;
  recipeId: string;
  origin: string;
  usage: ModelUsage;
}): Promise<void> {
  await insertCost({
    db,
    cost: {
      recipeId,
      provider: "google",
      model: usage.model,
      origin,
      usd: usage.usd,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      durationMs: usage.durationMs,
      note: usage.note,
    },
  });
}
