import type { NextRequest } from "next/server";
import { recipeClient } from "../../../lib/recipe";
import { RecipeSchema } from "../../../models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await RecipeSchema.safeParseAsync(body);

    if (!result.success) {
      console.error("Invalid user input", result.error);
      return new Response("invalid request!", {
        status: 400,
      });
    }

    const recipe = await recipeClient.add(body);

    if (!recipe) {
      console.error("Failed to add recipe", { recipe, body });
      return new Response(`could add the recipe ${body}`, {
        status: 400,
      });
    }

    return Response.json(recipe);
  } catch (e) {
    console.error("Server error on post recipe", e);
    return new Response("server error", {
      status: 500,
    });
  }
}
