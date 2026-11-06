import { deleteStockItem, patchStock } from "../../../../src/kitchen/stock-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Change one item in this kitchen. */
export async function PATCH(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return patchStock({ request, db, auth });
}

/** Remove one item from this kitchen. */
export async function DELETE(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return deleteStockItem({ request, db, auth });
}
