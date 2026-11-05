import type { Database } from "bun:sqlite";

import type { FoodyAuth } from "../auth/create-foody-auth";
import { deleteStock, insertStock, listStock, updateStock } from "../db/stock";
import { jsonError } from "../http/json-error";
import { pathParam, readJson } from "../http/request";
import { requireUser } from "../http/require-user";
import { readStockDraft } from "./read-stock";

/** Everything in the signed-in kitchen. */
export async function getStock({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Database;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(listStock({ db, householdId: current.household.id }));
}

/** Add one fridge, freezer, pantry, or spice item. */
export async function postStock({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Database;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const draft = readStockDraft(await readJson(request));

  if (!draft) {
    return jsonError({ status: 400, code: "bad_item" });
  }

  return Response.json(insertStock({ db, householdId: current.household.id, draft }), { status: 201 });
}

/** Change the name, amount, or whether a spice is in the kitchen. */
export async function patchStock({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Database;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const itemId = pathParam({ request, index: 3 });
  const draft = readStockDraft(await readJson(request));

  if (!itemId || !draft) {
    return jsonError({ status: 400, code: "bad_item" });
  }

  const saved = updateStock({ db, householdId: current.household.id, itemId, draft });

  if (!saved) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return Response.json(saved);
}

/** Remove one item from this kitchen. */
export async function deleteStockItem({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Database;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const itemId = pathParam({ request, index: 3 });
  const removed = itemId ? deleteStock({ db, householdId: current.household.id, itemId }) : false;

  if (!removed) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return new Response(null, { status: 204 });
}
