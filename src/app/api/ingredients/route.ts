import type { NextRequest } from "next/server";
import { ingredientClient } from "../../../lib/ingredient";

export async function GET() {
  try {
    const ingredients = await ingredientClient.getAll();

    if (!ingredients) {
      console.error("Failed getting incidents", { ingredients });
      return new Response(`Failed to get ingredients`, {
        status: 400,
      });
    }

    return Response.json(ingredients);
  } catch (e) {
    console.error("Server error on get all ingredients", e);
    return new Response("server error", {
      status: 500,
    });
  }
}
