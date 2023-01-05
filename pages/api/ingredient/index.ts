import { NextApiRequest, NextApiResponse } from "next";
import { ingredientClient } from "../../../lib/ingredient";
import { Ingredient, IngredientSchema } from "../../../models/ingredient";

export default async function ingredientHandler(
  req: NextApiRequest,
  res: NextApiResponse<Ingredient>
) {
  const { method } = req;

  const result = await IngredientSchema.safeParseAsync(req.body);

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

async function postHandler(body: Ingredient, res: NextApiResponse) {
  try {
    const ingredient = await ingredientClient.add(body);

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
