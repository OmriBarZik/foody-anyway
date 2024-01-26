import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { Recipe, RecipeSchema } from "../../../../models";
import { recipeClient } from "../../../../lib/recipe";
import { ObjectId } from "mongodb";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = params.id;

    const recipe = await recipeClient.get(id);

    if (!recipe) {
      console.error({ recipe, id });
      return new Response(`recipe "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(recipe);
  } catch (e) {
    console.error(e);
    return new Response("server error", {
      status: 500,
    });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const result = await RecipeSchema.safeParseAsync(request.body);
  const id = params.id;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    console.error("Invalid ID", id);
    return new Response("invalid request!", {
      status: 400,
    });
  }

  if (!result.success) {
    console.error("invalid body", result.error);
    return new Response("invalid request!", {
      status: 400,
    });
  }

  delete result.data._id;

  try {
    const recipe = await recipeClient.update(id, result.data);

    if (!recipe) {
      console.error({ recipe, id });
      return new Response(`recipe "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(recipe);
  } catch (e) {
    console.error(e);
    return new Response("server error", {
      status: 500,
    });
  }
}

async function DELETE(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const recipe = await recipeClient.remove(id);

    if (!recipe) {
      console.error({ recipe, id });
      return new Response(`recipe "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(recipe);
  } catch (e) {
    console.error(e);
    return new Response(`server error`, {
      status: 500,
    });
  }
}
