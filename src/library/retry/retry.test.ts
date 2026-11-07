import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { AttemptRow } from "../../db/attempts/attempts.types";
import type { Db } from "../../db/db.types";
import { openMemoryDb } from "../../db/testing/open-memory-db";
import { claimRetry, RETRIES_PER_RECIPE, RETRIES_PER_USER_PER_DAY } from "./claim-retry";
import { retryRecipe } from "./retry-recipe";

const GEMINI_OFF = { apiKey: null, model: "gemini-2.5-flash" };

beforeEach(() => {
  // No test reaches the network. Every page fetch comes back as a 404.
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("", { status: 404 })),
  );
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("a failed recipe can be read again and ends needs_review when the page has nothing", async () => {
  const db = await kitchenWith({ recipes: { soup: "failed" } });
  const outcome = await retryRecipe({ db, gemini: GEMINI_OFF, householdId: "home", userId: "ada", recipeId: "soup" });

  expect(outcome.status).toBe("done");
  expect(outcome.status === "done" ? outcome.recipe.extractionStatus : null).toBe("needs_review");
  expect(await countAttempts(db)).toBe(1);
});

test("a ready recipe is not read again", async () => {
  const db = await kitchenWith({ recipes: { soup: "ready" } });

  expect(await claimRetry({ db, householdId: "home", userId: "ada", recipeId: "soup" })).toEqual({
    status: "refused",
    code: "already_ready",
  });
});

test("another kitchen's recipe looks missing", async () => {
  const db = await kitchenWith({ recipes: { soup: "failed" } });
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('away', 'Other', '2026-01-01')").run();

  expect(await claimRetry({ db, householdId: "away", userId: "ada", recipeId: "soup" })).toEqual({
    status: "refused",
    code: "not_found",
  });
  expect(await countAttempts(db)).toBe(0);
});

test("a second retry right after the first waits for it to finish", async () => {
  const db = await kitchenWith({ recipes: { soup: "failed" } });
  const [first, second] = await Promise.all([
    claimRetry({ db, householdId: "home", userId: "ada", recipeId: "soup" }),
    claimRetry({ db, householdId: "home", userId: "ada", recipeId: "soup" }),
  ]);

  expect([first.status, second.status].sort()).toEqual(["claimed", "refused"]);
  expect(await countAttempts(db)).toBe(1);
});

test("one recipe stops after its retry allowance", async () => {
  const db = await kitchenWith({ recipes: { soup: "failed" } });
  await addOldRetries({ db, recipeId: "soup", count: RETRIES_PER_RECIPE, hoursAgo: 48 });

  expect(await claimRetry({ db, householdId: "home", userId: "ada", recipeId: "soup" })).toEqual({
    status: "refused",
    code: "retry_limit_recipe",
  });
});

test("one person stops after the daily allowance across recipes", async () => {
  const recipeIds = Array.from({ length: RETRIES_PER_USER_PER_DAY + 1 }, (_, index) => `dish-${index}`);
  const db = await kitchenWith({ recipes: Object.fromEntries(recipeIds.map((recipeId) => [recipeId, "failed"])) });

  for (const recipeId of recipeIds.slice(0, RETRIES_PER_USER_PER_DAY)) {
    await addOldRetries({ db, recipeId, count: 1, hoursAgo: 1 });
  }

  const last = recipeIds[RETRIES_PER_USER_PER_DAY] ?? "";

  expect(await claimRetry({ db, householdId: "home", userId: "ada", recipeId: last })).toEqual({
    status: "refused",
    code: "retry_limit_daily",
  });
});

test("yesterday's retries no longer count toward today's allowance", async () => {
  const db = await kitchenWith({ recipes: { soup: "needs_review", stew: "failed" } });
  await addOldRetries({ db, recipeId: "soup", count: RETRIES_PER_USER_PER_DAY, hoursAgo: 25 });

  expect((await claimRetry({ db, householdId: "home", userId: "ada", recipeId: "stew" })).status).toBe("claimed");
});

/** Recipes are given as id → extraction_status. */
async function kitchenWith({ recipes }: { recipes: Record<string, string> }): Promise<Db> {
  const db = await openMemoryDb();
  await db
    .query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
       VALUES ('ada', 'Ada', 'ada@example.com', true, '2026-01-01', '2026-01-01')`,
    )
    .run();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();

  for (const [recipeId, status] of Object.entries(recipes)) {
    await db
      .query(
        `INSERT INTO recipes (
        id, household_id, saved_by_user_id, source_url, platform, ingredients_json, steps_json,
        extraction_status, created_at
      ) VALUES (?, 'home', 'ada', ?, 'tiktok', '[]', '[]', ?, '2026-01-01')`,
      )
      .run(recipeId, `https://www.tiktok.com/@cook/video/${recipeId}`, status);
  }

  return db;
}

async function addOldRetries({
  db,
  recipeId,
  count,
  hoursAgo,
}: {
  db: Db;
  recipeId: string;
  count: number;
  hoursAgo: number;
}): Promise<void> {
  for (let repeat = 0; repeat < count; repeat++) {
    await db
      .query(
        `INSERT INTO extraction_attempts (id, recipe_id, household_id, user_id, trigger, created_at)
         VALUES (?, ?, 'home', 'ada', 'retry', now() - make_interval(hours => ?::int))`,
      )
      .run(crypto.randomUUID(), recipeId, hoursAgo);
  }
}

async function countAttempts(db: Db): Promise<number> {
  const rows = await db.query<AttemptRow>("SELECT * FROM extraction_attempts").all();

  return rows.length;
}
