import { recipeClient } from "../../../lib/recipe";

export async function GET() {
  try {
    const recipes = await recipeClient.getAll();

    if (!recipes) {
      console.error("Failed to get all recipes", { recipes });
      return new Response(`Failed to get recipes`, {
        status: 400,
      });
    }

    return Response.json(recipes);
  } catch (e) {
    console.error("Server error on get all recipes", e);
    return new Response("server error", {
      status: 500,
    });
  }
}
