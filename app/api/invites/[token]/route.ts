import { getInvite } from "../../../../src/http/account-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Kitchen name for an invite, without joining it. */
export async function GET(request: Request): Promise<Response> {
  const { db } = await appContext();

  return getInvite({ request, db });
}
