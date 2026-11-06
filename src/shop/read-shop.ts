import { isRecord } from "../shared/is-record";
import type { ShopCommand } from "./shop.types";

/** Parse a manual item or a request to copy a recipe's missing ingredients. */
export function readShopCommand(body: unknown): ShopCommand | null {
  if (!isRecord(body)) {
    return null;
  }

  if (typeof body.recipeId === "string" && body.recipeId.trim()) {
    return { kind: "recipe", recipeId: body.recipeId.trim() };
  }

  if (typeof body.name !== "string") {
    return null;
  }

  const name = body.name.trim();
  const amount = readAmount(body.amount);
  const unit = readUnit(body.unit);

  if (!name || name.length > 80 || amount === undefined || unit === undefined) {
    return null;
  }

  return { kind: "item", name, amount, unit };
}

function readAmount(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const amount = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return amount;
}

function readUnit(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const unit = value.trim();

  if (unit.length > 40) {
    return undefined;
  }

  return unit || null;
}
