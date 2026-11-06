import type { Db } from "../db/db.types";
import type { FoodyAuth } from "../auth/create-foody-auth";
import type { Locale } from "../domain/domain.types";
import { jsonError } from "../http/json-error";
import { pathParam, readJson } from "../http/request";
import { requireUser } from "../http/require-user";
import { readShopCommand } from "./read-shop";
import { addMissingFromRecipe, addShopItem, listShop, removeShopItem } from "./shop";

/** The shared shopping list. */
export async function getShop({ request, db, auth }: { request: Request; db: Db; auth: FoodyAuth }): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  return Response.json(await listShop({ db, householdId: current.household.id }));
}

/** Add a line by hand, or the missing ingredients for a saved recipe. */
export async function postShop({
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

  const command = readShopCommand(await readJson(request));

  if (!command) {
    return jsonError({ status: 400, code: "bad_item" });
  }

  if (command.kind === "item") {
    const items = await addShopItem({
      db,
      householdId: current.household.id,
      name: command.name,
      amount: command.amount,
      unit: command.unit,
    });

    return Response.json(items, { status: 201 });
  }

  const items = await addMissingFromRecipe({
    db,
    householdId: current.household.id,
    locale: asLocale(current.user.locale),
    recipeId: command.recipeId,
  });

  if (!items) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return Response.json(items, { status: 201 });
}

/** Remove one shopping line. */
export async function deleteShopItem({
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

  const itemId = pathParam({ request, index: 3 });
  const removed = itemId ? await removeShopItem({ db, householdId: current.household.id, itemId }) : false;

  if (!removed) {
    return jsonError({ status: 404, code: "not_found" });
  }

  return new Response(null, { status: 204 });
}

function asLocale(value: string | null | undefined): Locale {
  if (value === "he") {
    return "he";
  }

  return "en";
}
