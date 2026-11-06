import { postAcceptInvite } from "../../../../src/http/account-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Join the invited kitchen when this account's own kitchen is still empty. */
export async function POST(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return postAcceptInvite({ request, db, auth });
}
