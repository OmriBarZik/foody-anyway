/** One line on the shared shopping list. */
export type ShopItemView = {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  recipeId: string | null;
};

/** A row in shopping_items. */
export type ShopRow = {
  id: string;
  household_id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  recipe_id: string | null;
  created_at: string;
};

/** Add one named item, or the missing ingredients of a saved recipe. */
export type ShopCommand =
  { kind: "item"; name: string; amount: number | null; unit: string | null } | { kind: "recipe"; recipeId: string };
