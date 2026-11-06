import { expect, test } from "vitest";

import type { Db } from "../db/db.types";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { readProfile, saveProfile } from "./profile";

test("a profile starts empty and then stores every preference", async () => {
  const db = await openMemoryDb();
  await insertUser(db);

  expect(await readProfile({ db, userId: "ada" })).toEqual({
    allergies: [],
    diet: null,
    dislikes: [],
    maxMinutes: null,
    budget: null,
    interests: [],
  });

  const saved = await saveProfile({
    db,
    userId: "ada",
    profile: {
      allergies: ["peanut"],
      diet: "vegetarian",
      dislikes: ["cilantro"],
      maxMinutes: 30,
      budget: "low",
      interests: ["lemon"],
    },
  });

  expect(saved.diet).toBe("vegetarian");
  expect(saved.maxMinutes).toBe(30);
  expect((await readProfile({ db, userId: "ada" })).allergies).toEqual(["peanut"]);
});

async function insertUser(db: Db): Promise<void> {
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", locale, measurement, "isAdmin")
     VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01', 'en', 'metric', false)`,
    )
    .run();
}
