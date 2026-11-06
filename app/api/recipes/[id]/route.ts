import { getRecipe } from "../../../../src/http/library-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** One saved video, only if it is in this kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getRecipe({ request, db, auth });
}
