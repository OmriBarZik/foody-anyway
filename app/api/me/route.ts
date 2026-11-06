import { getMe, patchMe } from "../../../src/http/account-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** The signed-in account. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getMe({ request, db, auth });
}

/** Language and measurement for the signed-in person. */
export async function PATCH(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return patchMe({ request, db, auth });
}
