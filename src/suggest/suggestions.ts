import type { Db } from "../db/db.types";
import { listRecipes } from "../db/recipes";
import { listStock } from "../db/stock";
import type { Ingredient, Locale, RecipeView, StockItemView } from "../domain/domain.types";
import type { DietaryProfile } from "../profile/profile.types";
import { sameFood } from "../shared/food";
import { closeLimit, interestScore, profileBlocks } from "./filter-profile";
import type { MissingIngredient, RankedSuggestion, SuggestionMix, SuggestionView } from "./suggest.types";

/** Saved recipes this kitchen can cook, then recipes that need only a few extra items. */
export async function suggestionMix({
  db,
  householdId,
  locale,
  profile,
}: {
  db: Db;
  householdId: string;
  locale: Locale;
  profile: DietaryProfile;
}): Promise<SuggestionMix> {
  const stock = await listStock({ db, householdId });
  const ready: RankedSuggestion[] = [];
  const close: RankedSuggestion[] = [];
  const limit = closeLimit(profile);
  const recipes = await listRecipes({ db, householdId });

  for (const recipe of recipes) {
    const view = toSuggestion({ recipe, stock, locale, profile });

    if (!view) {
      continue;
    }

    const ranked = { view, score: interestScore({ recipe, profile }), title: recipe.title ?? "" };

    if (view.missing.length === 0) {
      ready.push(ranked);
    } else if (view.missing.length <= limit) {
      close.push(ranked);
    }
  }

  return {
    ready: ready.sort(byInterest).map((ranked) => ranked.view),
    close: close.sort(byInterest).map((ranked) => ranked.view),
  };
}

/** Ingredients in this recipe that the stock list does not cover. */
export function missingIngredients({
  recipe,
  stock,
  locale,
}: {
  recipe: RecipeView;
  stock: StockItemView[];
  locale: Locale;
}): MissingIngredient[] {
  return recipe.ingredients
    .filter((ingredient) => !stockCovers(stock, ingredient))
    .map((ingredient) => ({
      name: displayName({ ingredient, locale }),
      amount: ingredient.amount,
      unit: ingredient.unit,
    }));
}

function toSuggestion({
  recipe,
  stock,
  locale,
  profile,
}: {
  recipe: RecipeView;
  stock: StockItemView[];
  locale: Locale;
  profile: DietaryProfile;
}): SuggestionView | null {
  const readable = recipe.extractionStatus === "ready" || recipe.extractionStatus === "needs_review";

  if (!readable || recipe.ingredients.length === 0 || profileBlocks({ recipe, profile })) {
    return null;
  }

  return {
    recipeId: recipe.id,
    title: recipe.title,
    thumbnailUrl: recipe.thumbnailUrl,
    cookTime: recipe.cookTime,
    missing: missingIngredients({ recipe, stock, locale }),
  };
}

function stockCovers(stock: StockItemView[], ingredient: Ingredient): boolean {
  const names = [ingredient.name, ingredient.nameEn, ingredient.nameHe].filter((name): name is string => Boolean(name));

  return stock.some((item) => {
    if (item.location === "spices" && item.present === false) {
      return false;
    }

    return names.some((name) => sameFood(item.name, name));
  });
}

function displayName({ ingredient, locale }: { ingredient: Ingredient; locale: Locale }): string {
  if (locale === "he" && ingredient.nameHe) {
    return ingredient.nameHe;
  }

  if (locale === "en" && ingredient.nameEn) {
    return ingredient.nameEn;
  }

  return ingredient.name;
}

function byInterest(left: RankedSuggestion, right: RankedSuggestion): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.title.localeCompare(right.title);
}
