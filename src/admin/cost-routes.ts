import type { Db } from "../db/db.types";
import type { FoodyAuth } from "../auth/create-foody-auth";
import { jsonError } from "../http/json-error";
import { requireUser } from "../http/require-user";
import { listCosts } from "./list-costs";

/** Extraction costs for the app owner. Everyone else gets 403. */
export async function getCosts({
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

  if (current.user.isAdmin !== true) {
    return jsonError({ status: 403, code: "not_admin" });
  }

  return Response.json(await listCosts({ db }));
}
