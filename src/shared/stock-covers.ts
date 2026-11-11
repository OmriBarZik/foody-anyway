import type { Ingredient, StockItemView } from "../domain/domain.types";
import { sameFood } from "./food";

/** True when the shared kitchen has this ingredient. A spice marked absent does not count. */
export function stockCovers({ stock, ingredient }: { stock: StockItemView[]; ingredient: Ingredient }): boolean {
  const names = [ingredient.name, ingredient.nameEn, ingredient.nameHe].filter((name): name is string => Boolean(name));

  return stock.some((item) => {
    if (item.location === "spices" && item.present === false) {
      return false;
    }

    return names.some((name) => sameFood(item.name, name));
  });
}
