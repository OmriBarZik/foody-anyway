import { postRecipeRetry } from "../../../../../src/http/library-routes";
import { appContext } from "../../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Reading a video can wait on Gemini. */
export const maxDuration = 60;

/** Read a saved video again, within the retry limits. */
export async function POST(request: Request): Promise<Response> {
  const { auth, config, db } = await appContext();

  return postRecipeRetry({ request, db, auth, config });
}
