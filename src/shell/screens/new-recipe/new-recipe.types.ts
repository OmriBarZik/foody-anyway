/** An ingredient row in the hand-written recipe form. */
export type DraftIngredient = {
  id: string;
  amount: string;
  name: string;
};

/** A step row in the hand-written recipe form. */
export type DraftStep = {
  id: string;
  text: string;
};
