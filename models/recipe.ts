import { z } from "zod";
import { ObjectId } from "mongodb";
import { IngredientSchema } from "./ingredient";

export const RecipeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  steps: z.array(z.string()),
  ingredients: z.array(IngredientSchema),
  image: z.string(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
