import { deleteShopItem } from "../../../../src/shop/shop-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Remove one shopping line. */
export async function DELETE(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return deleteShopItem({ request, db, auth });
}
