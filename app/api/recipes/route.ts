import { getRecipes, postRecipe } from "../../../src/http/library-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** Reading a video can wait on Gemini. */
export const maxDuration = 60;

/** Videos saved in the signed-in kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getRecipes({ request, db, auth });
}

/** Save a cooking-video link and read the recipe from the page or from Gemini. */
export async function POST(request: Request): Promise<Response> {
  const { auth, config, db } = await appContext();

  return postRecipe({ request, db, auth, config });
}
