/** One ingredient line as typed: an amount such as "200 g" and a name. */
export type ManualIngredientInput = {
  amount: string;
  name: string;
};

/** A recipe written by hand, after the request body is checked. */
export type ManualRecipeInput = {
  title: string;
  cookTime: string | null;
  servings: string | null;
  sourceNote: string | null;
  ingredients: ManualIngredientInput[];
  steps: string[];
};
