import type { Db } from "../db/db.types";

import type { FoodyAuth } from "../auth/create-foody-auth";
import type { AppConfig } from "../config/config.types";
import { findRecipe, listRecipes } from "../db/recipes";
import { describeError } from "../library/extraction/extraction-log";
import { IN_PROGRESS_SECONDS } from "../library/retry/claim-retry";
import { retryRecipe } from "../library/retry/retry-recipe";
import type { RetryRefusalCode } from "../library/retry/retry.types";
import { SaveLinkError, saveLink } from "../library/save-link";
import { isRecord } from "../shared/is-record";
import { jsonError } from "./json-error";
import { pathParam, readJson } from "./request";
import { requireUser } from "./require-user";

/** HTTP status for each reason a retry is turned down. */
const RETRY_REFUSAL_STATUS: Record<RetryRefusalCode, number> = {
  not_found: 404,
  already_ready: 409,
  retry_in_progress: 409,
  retry_rate_limited: 429,
  retry_limit_daily: 429,
};

/** Seconds to send in Retry-After, for refusals that clear on their own. */
const RETRY_WAIT_SECONDS: Partial<Record<RetryRefusalCode, number>> = {
  retry_in_progress: IN_PROGRESS_SECONDS,
  retry_rate_limited: 60,
  retry_limit_daily: 24 * 60 * 60,
};

/** Videos saved in the signed-in kitchen. */
export async function getRecipes({
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

  return Response.json(await listRecipes({ db, householdId: current.household.id }));
}

/** One saved video, only if it is in this kitchen. */
export async function getRecipe({
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

  const recipeId = pathParam({ request, index: 3 });
  const recipe = recipeId ? await findRecipe({ db, householdId: current.household.id, recipeId }) : null;

  if (!recipe) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return Response.json(recipe);
}

/** Save a cooking-video link and read the recipe from the page or from Gemini. */
export async function postRecipe({
  request,
  db,
  auth,
  config,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
  config: AppConfig;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

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
      gemini: { apiKey: config.geminiApiKey, model: config.geminiModel },
      householdId: current.household.id,
      userId: current.user.id,
      rawUrl: body.url,
    });

    return Response.json(recipe);
  } catch (error) {
    if (error instanceof SaveLinkError) {
      return jsonError({ status: 400, code: error.code });
    }

    logRouteError({ route: "POST /api/recipes", error, secret: config.geminiApiKey });

    return jsonError({ status: 500, code: "save_failed" });
  }
}

/**
 * Read a saved video again. Only for a recipe in the caller's kitchen that is not ready yet,
 * and only within the per-recipe, per-person, and per-kitchen limits in claim-retry.
 */
export async function postRecipeRetry({
  request,
  db,
  auth,
  config,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
  config: AppConfig;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const recipeId = pathParam({ request, index: 3 });

  if (!recipeId) {
    return jsonError({ status: 404, code: "not_found" });
  }

  try {
    const outcome = await retryRecipe({
      db,
      gemini: { apiKey: config.geminiApiKey, model: config.geminiModel },
      householdId: current.household.id,
      userId: current.user.id,
      recipeId,
    });

    if (outcome.status === "refused") {
      return refusedRetry(outcome.code);
    }

    return Response.json(outcome.recipe);
  } catch (error) {
    logRouteError({ route: "POST /api/recipes/:id/retry", error, secret: config.geminiApiKey });

    return jsonError({ status: 500, code: "save_failed" });
  }
}

function refusedRetry(code: RetryRefusalCode): Response {
  const response = jsonError({ status: RETRY_REFUSAL_STATUS[code], code });
  const waitSeconds = RETRY_WAIT_SECONDS[code];

  if (waitSeconds) {
    response.headers.set("Retry-After", String(waitSeconds));
  }

  return response;
}

function logRouteError({ route, error, secret }: { route: string; error: unknown; secret: string | null }): void {
  console.error(JSON.stringify({ scope: "route", level: "error", route, ...describeError({ error, secret }) }));
}
