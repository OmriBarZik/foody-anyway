import { z } from "zod";
import { ObjectId } from "mongodb";

export const IngredientSchema = z.object({
  _id: z.instanceof(ObjectId).or(z.string()).optional(),
  name: z.string(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
