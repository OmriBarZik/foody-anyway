import type { Db } from "../db/db.types";

import type { FoodyAuth } from "../auth/create-foody-auth";
import { requireUser } from "../http/require-user";
import { listMembers } from "./list-members";

/** The people who share the signed-in kitchen. */
export async function getMembers({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(await listMembers({ db, householdId: current.household.id }));
}
