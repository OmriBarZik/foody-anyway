import { postManualRecipe } from "../../../../src/library/manual/manual-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Save a recipe written by hand. */
export async function POST(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return postManualRecipe({ request, db, auth });
}
