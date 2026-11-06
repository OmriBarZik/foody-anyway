import { appContext } from "../../../src/server/context";
import { getSuggestions } from "../../../src/suggest/suggest-routes";

export const dynamic = "force-dynamic";

/** Saved recipes this person can cook from the shared kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getSuggestions({ request, db, auth });
}
