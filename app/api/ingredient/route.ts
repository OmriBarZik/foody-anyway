import type { NextRequest, NextResponse } from "next/server";
import { ingredientClient } from "../../../lib/ingredient";
import { IngredientSchema } from "../../../models/ingredient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await IngredientSchema.safeParseAsync(body);

    if (!result.success) {
      console.error("Invalid user input", result.error);
      return new Response("invalid request!", {
        status: 400,
      });
    }

    const ingredient = await ingredientClient.add(body);

    if (!ingredient) {
      console.error({ ingredient, body });
      return new Response(`could add the ingredient ${body}`, {
        status: 400,
      });
    }

    return Response.json(ingredient);
  } catch (e) {
    console.error("Server error on post ingredient", e);
    return new Response("server error", {
      status: 500,
    });
  }
}
