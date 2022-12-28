import { z } from "zod";
import { ObjectId } from "mongodb";

export const IngredientSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  calories: z.number().optional(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
