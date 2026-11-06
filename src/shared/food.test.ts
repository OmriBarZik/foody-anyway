import { expect, test } from "vitest";
import { sameFood } from "./food";

test("food names match plurals, translations, and phrases without matching prefixes", () => {
  expect(sameFood("tomatoes", "tomato")).toBe(true);
  expect(sameFood("milk", "חלב")).toBe(true);
  expect(sameFood("chicken breast", "chicken")).toBe(true);
  expect(sameFood("eggplant", "egg")).toBe(false);
  expect(sameFood("buttermilk", "milk")).toBe(false);
  expect(sameFood("cheese", "cheeses")).toBe(true);
});
