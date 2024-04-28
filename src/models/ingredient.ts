import { z } from "zod";
import { ObjectId } from "mongodb";

export const IngredientSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  amount: z.number(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
