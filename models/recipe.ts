import { z } from "zod";
import { ObjectId } from "mongodb";
import { IngredientSchema } from "./ingredient";

export const RecipeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  title: z.string(),
  ingredients: z.array(IngredientSchema),
  description: z.string(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
