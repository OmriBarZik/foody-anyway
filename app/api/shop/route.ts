import { getShop, postShop } from "../../../src/shop/shop-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** The shared shopping list. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getShop({ request, db, auth });
}

/** Add a line by hand, or the missing ingredients for a saved recipe. */
export async function POST(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return postShop({ request, db, auth });
}
