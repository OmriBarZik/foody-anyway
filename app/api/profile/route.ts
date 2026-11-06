import { getProfile, putProfile } from "../../../src/profile/profile-routes";
import { appContext } from "../../../src/server/context";

export const dynamic = "force-dynamic";

/** The signed-in person's food preferences. */
export async function GET(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return getProfile({ request, db, auth });
}

/** Replace allergies, diet, dislikes, time, budget, and interests. */
export async function PUT(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return putProfile({ request, db, auth });
}
