import { expect, test } from "vitest";

import { listRecipes } from "../../db/recipes";
import { openMemoryDb } from "../../db/testing/open-memory-db";
import { readManualRecipe } from "./read-manual";
import { saveManualRecipe } from "./save-manual";

test("a hand-written recipe is saved ready, with parsed amounts and numbered steps", async () => {
  const db = await openMemoryDb();
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", locale, measurement, "isAdmin")
     VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01', 'en', 'metric', false)`,
    )
    .run();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();
  const input = readManualRecipe({
    title: " Lentil soup ",
    cookTime: "30 min",
    sourceNote: "Grandma",
    ingredients: [
      { amount: "200 g", name: "red lentils" },
      { amount: "", name: "" },
      { amount: "1", name: "onion" },
    ],
    steps: ["Soften the onion.", " ", "Add the lentils and simmer."],
  });

  expect(input).not.toBeNull();

  const saved = await saveManualRecipe({ db, householdId: "home", userId: "ada", input: input! });
  const listed = await listRecipes({ db, householdId: "home" });

  expect(saved.platform).toBe("manual");
  expect(saved.extractionStatus).toBe("ready");
  expect(saved.sourceNote).toBe("Grandma");
  expect(saved.title).toBe("Lentil soup");
  expect(saved.ingredients.map((item) => [item.name, item.amount, item.unit])).toEqual([
    ["red lentils", 200, "g"],
    ["onion", 1, null],
  ]);
  expect(saved.steps).toEqual([
    { order: 1, text: "Soften the onion." },
    { order: 2, text: "Add the lentils and simmer." },
  ]);
  expect(listed.map((recipe) => recipe.id)).toEqual([saved.id]);
});

test("a hand-written recipe needs a title and something to cook from", () => {
  expect(readManualRecipe({ title: "", ingredients: [], steps: ["Boil."] })).toBeNull();
  expect(readManualRecipe({ title: "Toast", ingredients: [], steps: [] })).toBeNull();
  expect(readManualRecipe({ title: "Toast", ingredients: "bread", steps: [] })).toBeNull();
});
