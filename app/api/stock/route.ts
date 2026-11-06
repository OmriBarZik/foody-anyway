import { getStock, postStock } from "../../../src/kitchen/stock-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** Everything in the signed-in kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getStock({ request, db, auth });
}

/** Add one fridge, freezer, pantry, or spice item. */
export async function POST(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return postStock({ request, db, auth });
}
