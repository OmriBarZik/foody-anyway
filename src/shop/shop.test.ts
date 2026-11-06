import { expect, test } from "vitest";

import type { Db } from "../db/db.types";
import { insertStock } from "../db/stock";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { addMissingFromRecipe, addShopItem, listShop, removeShopItem } from "./shop";

test("shopping keeps hand-added lines and skips ingredients the kitchen already has", async () => {
  const db = await openMemoryDb();
  await insertKitchen(db);
  await insertStock({
    db,
    householdId: "home",
    draft: { location: "fridge", name: "milk", amount: 1, unit: "L", present: null },
  });
  const added = await addShopItem({ db, householdId: "home", name: "bread", amount: 1, unit: "pcs" });
  const fromRecipe = await addMissingFromRecipe({ db, householdId: "home", locale: "en", recipeId: "soup" });
  const names = (fromRecipe ?? []).map((item) => item.name);
  const listed = await listShop({ db, householdId: "home" });

  expect(added.map((item) => item.name)).toEqual(["bread"]);
  expect(names).toContain("cumin");
  expect(names).not.toContain("milk");
  expect(await removeShopItem({ db, householdId: "home", itemId: listed[0]?.id ?? "" })).toBe(true);
  expect(await addMissingFromRecipe({ db, householdId: "home", locale: "en", recipeId: "missing" })).toBeNull();
});

async function insertKitchen(db: Db): Promise<void> {
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", locale, measurement, "isAdmin")
     VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01', 'en', 'metric', false)`,
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
      'Lemon soup', NULL, '20 min', ?, '[]', 'en', 'metric', 'ready', NULL, '2026-01-02'
    )`,
    )
    .run(JSON.stringify([ingredient("milk"), ingredient("cumin")]));
}

function ingredient(name: string): Record<string, unknown> {
  return { name, nameEn: name, nameHe: null, amount: 1, unit: null, system: "none", note: null };
}
