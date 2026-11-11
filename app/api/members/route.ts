import { getMembers } from "../../../src/household/household-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** The people who share the signed-in kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getMembers({ request, db, auth });
}
