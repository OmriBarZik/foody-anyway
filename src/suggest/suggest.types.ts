/** An ingredient the kitchen does not already cover. */
export type MissingIngredient = {
  name: string;
  amount: number | null;
  unit: string | null;
};

/** A saved recipe in the suggestion mix. */
export type SuggestionView = {
  recipeId: string;
  title: string | null;
  thumbnailUrl: string | null;
  cookTime: string | null;
  missing: MissingIngredient[];
};

/** Recipes the kitchen can cook now, and recipes that need a few items. */
export type SuggestionMix = {
  ready: SuggestionView[];
  close: SuggestionView[];
};

/** A suggestion plus the interest score used only for ordering. */
export type RankedSuggestion = {
  view: SuggestionView;
  score: number;
  title: string;
};
