import type { Db } from "../../db/db.types";

import type { FoodyAuth } from "../../auth/create-foody-auth";
import { jsonError } from "../../http/json-error";
import { readJson } from "../../http/request";
import { requireUser } from "../../http/require-user";
import { readManualRecipe } from "./read-manual";
import { saveManualRecipe } from "./save-manual";

/** Save a recipe written by hand in the signed-in kitchen. */
export async function postManualRecipe({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const input = readManualRecipe(await readJson(request));

  if (!input) {
    return jsonError({ status: 400, code: "bad_recipe" });
  }

  const recipe = await saveManualRecipe({
    db,
    householdId: current.household.id,
    userId: current.user.id,
    input,
  });

  return Response.json(recipe);
}
