import { expect, test } from "vitest";

import { splitStep } from "./step-parts";

test("ingredient words in a step are picked out, longest name first, with plurals", () => {
  const parts = splitStep({
    text: "Soften the leeks and garlic, then add the green chili and an egg.",
    terms: [
      { index: 0, names: ["Leek"] },
      { index: 1, names: ["Garlic (3 cloves)"] },
      { index: 2, names: ["Green chili"] },
      { index: 3, names: ["Eggs"] },
    ],
  });

  expect(parts.filter((part) => part.kind === "ingredient")).toEqual([
    { kind: "ingredient", text: "leeks", index: 0 },
    { kind: "ingredient", text: "garlic", index: 1 },
    { kind: "ingredient", text: "green chili", index: 2 },
    { kind: "ingredient", text: "egg", index: 3 },
  ]);
  expect(parts.map((part) => part.text).join("")).toBe(
    "Soften the leeks and garlic, then add the green chili and an egg.",
  );
});

test("a short last word and words inside other words are left alone", () => {
  const parts = splitStep({
    text: "Drizzle the oil over the toiletries.",
    terms: [{ index: 0, names: ["olive oil"] }],
  });

  expect(parts).toEqual([{ kind: "text", text: "Drizzle the oil over the toiletries." }]);
});

test("Hebrew words with a joined prefix still point at the ingredient", () => {
  const parts = splitStep({
    text: "מוסיפים את הביצים ומלח",
    terms: [
      { index: 0, names: ["ביצים"] },
      { index: 1, names: ["מלח"] },
    ],
  });

  expect(parts).toEqual([
    { kind: "text", text: "מוסיפים את ה" },
    { kind: "ingredient", text: "ביצים", index: 0 },
    { kind: "text", text: " ו" },
    { kind: "ingredient", text: "מלח", index: 1 },
  ]);
});
