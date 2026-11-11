/** The words a step might use for one ingredient, and where that ingredient sits in the list. */
export type IngredientTerm = {
  index: number;
  names: string[];
};

/** A run of step text, or a word that names an ingredient. */
export type StepPart = { kind: "text"; text: string } | { kind: "ingredient"; text: string; index: number };

/** One ingredient as the recipe screen shows it. `have` is null until the kitchen stock loads. */
export type IngredientLine = {
  index: number;
  name: string;
  amount: string | null;
  have: boolean | null;
};
