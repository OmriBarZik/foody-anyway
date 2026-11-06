import { expect, test } from "vitest";

import type { Db } from "../db/db.types";
import { insertStock } from "../db/stock";
import { openMemoryDb } from "../db/testing/open-memory-db";
import type { DietaryProfile } from "../profile/profile.types";
import { suggestionMix } from "./suggestions";

const EMPTY: DietaryProfile = {
  allergies: [],
  diet: null,
  dislikes: [],
  maxMinutes: null,
  budget: null,
  interests: [],
};

test("suggestions split ready recipes from close ones and honor the profile", async () => {
  const db = await openMemoryDb();
  await insertKitchen(db);
  await insertStock({
    db,
    householdId: "home",
    draft: { location: "fridge", name: "milk", amount: 1, unit: "L", present: null },
  });
  await insertStock({
    db,
    householdId: "home",
    draft: { location: "spices", name: "cumin", amount: null, unit: null, present: true },
  });
  const open = await suggestionMix({ db, householdId: "home", locale: "en", profile: EMPTY });

  expect(open.ready.map((item) => item.title)).toEqual(["Lemon soup"]);
  expect(open.close.map((item) => item.title)).toEqual(["Chicken tray"]);

  const allergic = await suggestionMix({
    db,
    householdId: "home",
    locale: "en",
    profile: { ...EMPTY, allergies: ["milk"] },
  });

  expect(allergic.ready).toHaveLength(0);

  const vegetarian = await suggestionMix({
    db,
    householdId: "home",
    locale: "en",
    profile: { ...EMPTY, diet: "vegetarian" },
  });

  expect(vegetarian.close.map((item) => item.title)).not.toContain("Chicken tray");

  const rushed = await suggestionMix({
    db,
    householdId: "home",
    locale: "en",
    profile: { ...EMPTY, maxMinutes: 15 },
  });

  expect(rushed.ready.map((item) => item.title)).not.toContain("Lemon soup");
});

async function insertKitchen(db: Db): Promise<void> {
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", locale, measurement, "isAdmin")
     VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01', 'en', 'metric', false)`,
    )
    .run();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();
  await insertRecipe({ db, id: "soup", title: "Lemon soup", cookTime: "20 min", names: ["milk", "cumin"] });
  await insertRecipe({ db, id: "tray", title: "Chicken tray", cookTime: "40 min", names: ["chicken", "cumin"] });
}

async function insertRecipe({
  db,
  id,
  title,
  cookTime,
  names,
}: {
  db: Db;
  id: string;
  title: string;
  cookTime: string;
  names: string[];
}): Promise<void> {
  await db
    .query(
      `INSERT INTO recipes (
      id, household_id, saved_by_user_id, source_url, platform, thumbnail_url, dish_image_url,
      title, servings, cook_time, ingredients_json, steps_json, source_language, source_measurement,
      extraction_status, extraction_note, created_at
    ) VALUES (?, 'home', 'ada', ?, 'youtube', NULL, NULL, ?, NULL, ?, ?, '[]', 'en', 'metric', 'ready', NULL, '2026-01-02')`,
    )
    .run(
      id,
      `https://youtu.be/${id}`,
      title,
      cookTime,
      JSON.stringify(
        names.map((name) => ({
          name,
          nameEn: name,
          nameHe: null,
          amount: 1,
          unit: null,
          system: "none",
          note: null,
        })),
      ),
    );
}
