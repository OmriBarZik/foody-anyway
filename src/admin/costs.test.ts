import { expect, test } from "vitest";

import { insertCost } from "../db/costs";
import type { Db } from "../db/db.types";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { listCosts } from "./list-costs";

test("cost report totals every extraction for the owner", async () => {
  const db = await openMemoryDb();
  await insertRecipe(db);
  await insertCost({
    db,
    cost: {
      recipeId: "soup",
      provider: "gemini",
      model: "gemini-2.5-flash",
      origin: "video",
      usd: 0.02,
      inputTokens: 10,
      outputTokens: 20,
      durationMs: 1000,
      note: null,
    },
  });
  await insertCost({
    db,
    cost: {
      recipeId: "soup",
      provider: "crawler",
      model: null,
      origin: "page",
      usd: 0,
      inputTokens: null,
      outputTokens: null,
      durationMs: 40,
      note: null,
    },
  });
  const report = await listCosts({ db });

  expect(report.totalUsd).toBeCloseTo(0.02);
  expect(report.rows.map((row) => row.origin).sort()).toEqual(["page", "video"]);
  expect(report.rows[0]?.recipeTitle).toBe("Lemon soup");
});

async function insertRecipe(db: Db): Promise<void> {
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", locale, measurement, "isAdmin")
     VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01', 'en', 'metric', true)`,
    )
    .run();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();
  await db
    .query(
      `INSERT INTO recipes (
      id, household_id, saved_by_user_id, source_url, platform, thumbnail_url, dish_image_url,
      title, servings, cook_time, ingredients_json, steps_json, source_language, source_measurement,
      extraction_status, extraction_note, created_at
    ) VALUES (
      'soup', 'home', 'ada', 'https://youtu.be/soup', 'youtube', NULL, NULL,
      'Lemon soup', NULL, '20 min', '[]', '[]', 'en', 'metric', 'ready', NULL, '2026-01-02'
    )`,
    )
    .run();
}
