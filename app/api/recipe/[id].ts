import type { NextApiRequest, NextApiResponse } from "next";
import { Recipe, RecipeSchema } from "../../../models";
import { recipeClient } from "../../../lib/recipe";
import { ObjectId } from "mongodb";

export default async function ingredientHandler(
  req: NextApiRequest,
  res: NextApiResponse<Recipe>,
) {
  const {
    query: { id },
    method,
  } = req;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    res.status(400).end("invalid ID");
    return;
  }

  switch (method) {
    case "GET":
      await getHandler(id, res);
      break;
    case "PUT":
      await putHandler(id, req, res);
      break;
    case "DELETE":
      await deleteHandler(id, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function getHandler(id: string, res: NextApiResponse<Recipe>) {
  try {
    const ingredient = await recipeClient.get(id);

    if (!ingredient) {
      console.error({ ingredient, id });
      res.status(400).end(`ingredient "${id}" not found!`);
      return;
    }

    res.status(200).json(ingredient);
  } catch (e) {
    console.error(e);
    res.status(500).end("server error");
  }
}

async function putHandler(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse<Recipe>,
) {
  const result = await RecipeSchema.safeParseAsync(req.body);

  if (!result.success) {
    console.error(result.error);
    res.status(400).end("invalid request!");
    return;
  }

  delete result.data._id;

  try {
    const ingredient = await recipeClient.update(id, result.data);

    if (!ingredient) {
      console.error({ ingredient, id });
      res.status(400).end(`ingredient "${id}" not found!`);
      return;
    }

    res.status(200).json(ingredient);
  } catch (e) {
    console.error(e);
    res.status(500).end("server error");
  }
}

async function deleteHandler(id: string, res: NextApiResponse<Recipe>) {
  try {
    const ingredient = await recipeClient.remove(id);

    if (!ingredient) {
      console.error({ ingredient, id });
      res.status(400).end(`ingredient "${id}" not found!`);
      return;
    }

    res.status(200).json(ingredient);
  } catch (e) {
    console.error(e);
    res.status(500).end("server error");
  }
}
