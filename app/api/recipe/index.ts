import { NextApiRequest, NextApiResponse } from "next";
import { recipeClient } from "../../../lib/recipe";
import { Recipe, RecipeSchema } from "../../../models";

export default async function ingredientHandler(
  req: NextApiRequest,
  res: NextApiResponse<Recipe>,
) {
  const { method } = req;

  const result = await RecipeSchema.safeParseAsync(req.body);

  if (!result.success) {
    console.error(result.error);
    res.status(400).end("invalid request!");
    return;
  }

  switch (method) {
    case "POST":
      await postHandler(result.data, res);
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function postHandler(body: Recipe, res: NextApiResponse<Recipe>) {
  try {
    const ingredient = await recipeClient.add(body);

    if (!ingredient) {
      console.error({ ingredient, body });
      res.status(400).end(`could add the ingredient ${body}`);
      return;
    }

    res.status(200).json(ingredient);
  } catch (e) {
    console.error(e);
    res.status(500).end("server error");
  }
}
