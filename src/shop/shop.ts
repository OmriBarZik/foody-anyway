import type { Db } from "../db/db.types";
import { findRecipe } from "../db/recipes";
import { listStock } from "../db/stock";
import type { Locale } from "../domain/domain.types";
import { sameFood } from "../shared/food";
import { missingIngredients } from "../suggest/suggestions";
import type { ShopItemView, ShopRow } from "./shop.types";

/** The household shopping list, oldest first. */
export async function listShop({ db, householdId }: { db: Db; householdId: string }): Promise<ShopItemView[]> {
  const rows = await db
    .query<ShopRow>("SELECT * FROM shopping_items WHERE household_id = ? ORDER BY created_at, name")
    .all(householdId);

  return rows.map(toView);
}

/** Add one item and return the whole list. */
export async function addShopItem({
  db,
  householdId,
  name,
  amount,
  unit,
}: {
  db: Db;
  householdId: string;
  name: string;
  amount: number | null;
  unit: string | null;
}): Promise<ShopItemView[]> {
  await insertItem({ db, householdId, name, amount, unit, recipeId: null });

  return listShop({ db, householdId });
}

/** Add ingredients the kitchen is missing for one saved recipe. Returns null when the recipe is not here. */
export async function addMissingFromRecipe({
  db,
  householdId,
  locale,
  recipeId,
}: {
  db: Db;
  householdId: string;
  locale: Locale;
  recipeId: string;
}): Promise<ShopItemView[] | null> {
  const recipe = await findRecipe({ db, householdId, recipeId });

  if (!recipe) {
    return null;
  }

  const existing = await listShop({ db, householdId });
  const stock = await listStock({ db, householdId });
  const missing = missingIngredients({ recipe, stock, locale });

  for (const item of missing) {
    const already = existing.some((row) => sameFood(row.name, item.name));

    if (already) {
      continue;
    }

    await insertItem({ db, householdId, name: item.name, amount: item.amount, unit: item.unit, recipeId });
    existing.push({ id: "", name: item.name, amount: item.amount, unit: item.unit, recipeId });
  }

  return listShop({ db, householdId });
}

/** Remove one line. False when it is not in this kitchen. */
export async function removeShopItem({
  db,
  householdId,
  itemId,
}: {
  db: Db;
  householdId: string;
  itemId: string;
}): Promise<boolean> {
  const result = await db
    .query("DELETE FROM shopping_items WHERE household_id = ? AND id = ?")
    .run(householdId, itemId);

  return result.changes > 0;
}

async function insertItem({
  db,
  householdId,
  name,
  amount,
  unit,
  recipeId,
}: {
  db: Db;
  householdId: string;
  name: string;
  amount: number | null;
  unit: string | null;
  recipeId: string | null;
}): Promise<void> {
  await db
    .query(
      `INSERT INTO shopping_items (id, household_id, name, amount, unit, recipe_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(crypto.randomUUID(), householdId, name, amount, unit, recipeId, new Date().toISOString());
}

function toView(row: ShopRow): ShopItemView {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    unit: row.unit,
    recipeId: row.recipe_id,
  };
}
