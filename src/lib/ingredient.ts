import type { Ingredient } from "../models/ingredient";
import { BaseClient } from "./base";

export class IngredientClient extends BaseClient<Ingredient> {
  constructor() {
    super("ingredient");
  }
}

export const ingredientClient = new IngredientClient();
