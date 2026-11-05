import type { StockDraft } from "../db/db.types";
import type { StockLocation } from "../domain/domain.types";
import { isRecord } from "../shared/is-record";

const LOCATIONS: readonly StockLocation[] = ["fridge", "freezer", "pantry", "spices"];

/** Turn a JSON body into a stock item, or null when the fields don't fit the location. */
export function readStockDraft(body: unknown): StockDraft | null {
  if (!isRecord(body) || typeof body.name !== "string" || !isLocation(body.location)) {
    return null;
  }

  const name = body.name.trim();

  if (!name || name.length > 80) {
    return null;
  }

  if (body.location === "spices") {
    if (typeof body.present !== "boolean") {
      return null;
    }

    return { location: body.location, name, amount: null, unit: null, present: body.present };
  }

  const amount = readAmount(body.amount);
  const unit = readUnit(body.unit);

  if (amount === null || unit === undefined) {
    return null;
  }

  return { location: body.location, name, amount, unit, present: null };
}

function isLocation(value: unknown): value is StockLocation {
  return typeof value === "string" && LOCATIONS.includes(value as StockLocation);
}

function readAmount(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return amount;
}

function readUnit(value: unknown): string | null | undefined {
  if (value === undefined || value === null) {
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
