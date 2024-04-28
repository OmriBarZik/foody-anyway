import { NextRequest } from "next/server";
import { IngredientSchema } from "../../../../models/ingredient";
import { ingredientClient } from "../../../../lib/ingredient";
import { ObjectId } from "mongodb";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  const id = params.id;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return new Response("invalid request!", {
      status: 400,
    });
  }

  try {
    const ingredient = await ingredientClient.get(id);

    if (!ingredient) {
      console.error({ ingredient, id });
      console.error("Failed to get ingredient", { ingredient, id });
      return new Response(`ingredient "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(ingredient);
  } catch (e) {
    console.error(e);
    return new Response("server error", {
      status: 500,
    });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const result = await IngredientSchema.safeParseAsync(request.body);
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
    const ingredient = await ingredientClient.update(id, result.data);

    if (!ingredient) {
      console.error("Failed to update ingredient", { ingredient, id });
      return new Response(`ingredient "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(ingredient);
  } catch (e) {
    console.error(e);
    return new Response("server error", {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const id = params.id;

  try {
    const ingredient = await ingredientClient.remove(id);

    if (!ingredient) {
      console.error({ ingredient, id });
      return new Response(`ingredient "${id}" not found!`, {
        status: 400,
      });
    }

    return Response.json(ingredient);
  } catch (e) {
    console.error("delete ingredient failed", e);
    return new Response(`server error`, {
      status: 500,
    });
  }
}
