import type { NextApiRequest, NextApiResponse } from "next";
import { Ingredient, IngredientSchema } from "../../../models/ingredient";
import { ingredientClient } from "../../../lib/ingredient";
import { ObjectId } from "mongodb";

export default async function ingredientHandler(
  req: NextApiRequest,
  res: NextApiResponse<Ingredient>
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

async function getHandler(id: string, res: NextApiResponse) {
  try {
    const ingredient = await ingredientClient.get(id);

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
  res: NextApiResponse
) {
  const result = await IngredientSchema.safeParseAsync(req.body);

  if (!result.success) {
    console.error(result.error);
    res.status(400).end("invalid request!");
    return;
  }

  delete result.data._id;

  try {
    const ingredient = await ingredientClient.update(id, result.data);

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

async function deleteHandler(id: string, res: NextApiResponse) {
  try {
    const ingredient = await ingredientClient.remove(id);

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
