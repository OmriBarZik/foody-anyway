import { expect, test } from "vitest";

import { listStock } from "../db/stock";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { answerGuess, nextGuess } from "./guess";

test("have adds stock and skip only marks the card as seen", async () => {
  const db = await openMemoryDb();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();
  const first = await nextGuess({ db, householdId: "home", locale: "en" });

  expect(first.card?.stapleEn).toBe("milk");

  const afterHave = await answerGuess({
    db,
    householdId: "home",
    locale: "he",
    stapleEn: "milk",
    decision: "have",
  });
  const stock = await listStock({ db, householdId: "home" });

  expect(stock.map((item) => item.name)).toEqual(["חלב"]);
  expect(stock[0]?.location).toBe("fridge");
  expect(afterHave?.card?.stapleEn).toBe("eggs");

  const afterSkip = await answerGuess({
    db,
    householdId: "home",
    locale: "en",
    stapleEn: "eggs",
    decision: "skip",
  });
  const afterSkipStock = await listStock({ db, householdId: "home" });

  expect(afterSkipStock).toHaveLength(1);
  expect(afterSkip?.card?.stapleEn).toBe("butter");
  expect(await answerGuess({ db, householdId: "home", locale: "en", stapleEn: "nope", decision: "have" })).toBeNull();
});
