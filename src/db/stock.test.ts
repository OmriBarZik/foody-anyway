import { expect, test } from "bun:test";
import { openDb } from "./open-db";
import { deleteStock, insertStock, listStock, updateStock } from "./stock";

test("stock keeps amounts for food and presence for spices", () => {
  const db = openDb(":memory:");
  db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Kitchen', '2026-01-01')").run();

  const milk = insertStock({
    db,
    householdId: "home",
    draft: { location: "fridge", name: "Milk", amount: 1, unit: "L", present: null },
  });
  insertStock({
    db,
    householdId: "home",
    draft: { location: "spices", name: "Cumin", amount: null, unit: null, present: true },
  });

  const updated = updateStock({
    db,
    householdId: "home",
    itemId: milk.id,
    draft: { location: "fridge", name: "Milk", amount: 0.5, unit: "L", present: null },
  });
  const items = listStock({ db, householdId: "home" });

  expect(updated?.amount).toBe(0.5);
  expect(items.map((item) => item.name)).toEqual(["Milk", "Cumin"]);
  expect(items.find((item) => item.name === "Cumin")?.present).toBe(true);
  expect(deleteStock({ db, householdId: "home", itemId: milk.id })).toBe(true);
  expect(listStock({ db, householdId: "home" })).toHaveLength(1);
});
