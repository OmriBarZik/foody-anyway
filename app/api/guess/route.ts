import { getGuess, postGuess } from "../../../src/guess/guess-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** The next ingredient card for this kitchen. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getGuess({ request, db, auth });
}

/** Save a swipe and return the following card. */
export async function POST(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return postGuess({ request, db, auth });
}
