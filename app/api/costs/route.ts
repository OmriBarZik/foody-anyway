import { getCosts } from "../../../src/admin/cost-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** Extraction costs for the app owner. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getCosts({ request, db, auth });
}
