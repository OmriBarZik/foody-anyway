import { patchHousehold } from "../../../src/household/household-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** Rename the signed-in kitchen. */
export async function PATCH(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return patchHousehold({ request, db, auth });
}
