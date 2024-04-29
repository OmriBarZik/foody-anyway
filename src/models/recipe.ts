import { z } from "zod";
import { ObjectId } from "mongodb";
import { IngredientSchema } from "./ingredient";

export const RecipeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  creationDate: z.date(),
  title: z.string(),
  ingredients: z.array(
    z.object({ Ingredient: IngredientSchema, amount: z.number() })
  ),
  steps: z.array(
    z.object({
      description: z.string(),
    })
  ),
});

export type Recipe = z.infer<typeof RecipeSchema>;
