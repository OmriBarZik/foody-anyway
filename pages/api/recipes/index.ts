import type { NextApiRequest, NextApiResponse } from "next";
import { recipeClient } from "../../../lib/recipe";
import { Recipe } from "../../../models";

export default async function ingredientHandler(
  req: NextApiRequest,
  res: NextApiResponse<Recipe[]>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      await getHandler(res);
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function getHandler(res: NextApiResponse<Recipe[]>) {
  try {
    const ingredients = await recipeClient.getAll();

    if (!ingredients) {
      console.error({ ingredients });
      res.status(400).end(`Failed to get ingredients`);
      return;
    }

    res.status(200).json(ingredients);
  } catch (e) {
    console.error(e);
    res.status(500).end("server error");
  }
}
