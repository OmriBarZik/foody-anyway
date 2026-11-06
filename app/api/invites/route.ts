import { postInvite } from "../../../src/http/account-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** Create an invite link for this kitchen. */
export async function POST(request: Request): Promise<Response> {
  const { auth, config, db } = await appContext();

  return postInvite({ request, db, auth, config });
}
