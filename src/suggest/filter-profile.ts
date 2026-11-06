import type { Ingredient, RecipeView } from "../domain/domain.types";
import type { DietaryProfile } from "../profile/profile.types";
import { mentionsFood } from "../shared/food";
import { cookMinutes } from "./cook-minutes";
import { dietBlocks } from "./diet-conflict";

/** True when this person's profile should hide the recipe. Unknown cook times stay visible. */
export function profileBlocks({ recipe, profile }: { recipe: RecipeView; profile: DietaryProfile }): boolean {
  const names = ingredientLabels(recipe);

  if (mentionsFood({ names, words: [...profile.allergies, ...profile.dislikes] })) {
    return true;
  }

  if (dietBlocks({ diet: profile.diet, names })) {
    return true;
  }

  if (profile.maxMinutes === null) {
    return false;
  }

  const minutes = cookMinutes(recipe.cookTime);

  return minutes !== null && minutes > profile.maxMinutes;
}

/** How many missing items still count as "a few". A low budget keeps that list shorter. */
export function closeLimit(profile: DietaryProfile): number {
  if (profile.budget === "low") {
    return 2;
  }

  return 4;
}

/** Higher when the title or an ingredient mentions one of the person's interests. */
export function interestScore({ recipe, profile }: { recipe: RecipeView; profile: DietaryProfile }): number {
  const names = [recipe.title ?? "", ...ingredientLabels(recipe)];

  return profile.interests.filter((interest) => mentionsFood({ names, words: [interest] })).length;
}

function ingredientLabels(recipe: RecipeView): string[] {
  return recipe.ingredients.flatMap((ingredient) => labels(ingredient));
}

function labels(ingredient: Ingredient): string[] {
  return [ingredient.name, ingredient.nameEn, ingredient.nameHe].filter((name): name is string => Boolean(name));
}
