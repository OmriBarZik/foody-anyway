import type { Database } from "bun:sqlite";

import type { AppConfig } from "../config/config.types";
import { findRecipe, listRecipes } from "../db/recipes";
import { SaveLinkError, saveLink } from "../library/save-link";
import { isRecord } from "../shared/is-record";
import { jsonError } from "./json-error";
import { pathParam, readJson } from "./request";
import { requireUser } from "./require-user";

/** Videos saved in the signed-in kitchen. */
export function getRecipes({ request, db }: { request: Request; db: Database }): Response {
  const current = requireUser({ db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(listRecipes({ db, householdId: current.household.id }));
}

/** One saved video, only if it is in this kitchen. */
export function getRecipe({ request, db }: { request: Request; db: Database }): Response {
  const current = requireUser({ db, request });

  if (current instanceof Response) {
    return current;
  }

  const recipeId = pathParam({ request, index: 3 });
  const recipe = recipeId ? findRecipe({ db, householdId: current.household.id, recipeId }) : null;

  if (!recipe) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return Response.json(recipe);
}

/** Save a cooking-video link and read the recipe from the page or from Gemini. */
export async function postRecipe({
  request,
  db,
  config,
}: {
  request: Request;
  db: Database;
  config: AppConfig;
}): Promise<Response> {
  const current = requireUser({ db, request });

  if (current instanceof Response) {
    return current;
  }

  const body = await readJson(request);

  if (!isRecord(body) || typeof body.url !== "string") {
    return jsonError({ status: 400, code: "bad_link" });
  }

  try {
    const recipe = await saveLink({
      db,
      geminiApiKey: config.geminiApiKey,
      geminiModel: config.geminiModel,
      householdId: current.household.id,
      userId: current.user.id,
      rawUrl: body.url,
    });

    return Response.json(recipe);
  } catch (error) {
    if (error instanceof SaveLinkError) {
      return jsonError({ status: 400, code: error.code });
    }

    console.error(error instanceof Error ? error.message : "Error");

    return jsonError({ status: 500, code: "save_failed" });
  }
}
