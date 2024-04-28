import type { Recipe as RecipeType } from "../models/recipe";
import { BaseClient } from "./base";

export class RecipeClient extends BaseClient<RecipeType> {
  constructor() {
    super("recipe");
  }
}

export const recipeClient = new RecipeClient();
