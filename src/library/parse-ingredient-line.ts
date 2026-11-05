import type { Ingredient } from "../domain/domain.types";
import { splitLeadingUnit } from "./convert-units";

const AMOUNT = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d{1,3}(?:,\d{3})+|\d+(?:[.,]\d+)?)(?:\s+|(?=\p{L}))(.+)$/u;

/** Parse one ingredient line into an amount, a unit, and a name. */
export function parseIngredientLine(line: string): Ingredient | null {
  const stripped = line.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim();

  if (!stripped) {
    return null;
  }

  const match = AMOUNT.exec(stripped);
  const amountText = match?.[1];
  const rest = match?.[2];
  const amount = amountText ? parseAmount(amountText) : null;

  if (!rest || amount === null) {
    return bareIngredient({ name: stripped });
  }

  const split = splitLeadingUnit(rest);

  if (!split?.name) {
    return bareIngredient({ name: rest, amount });
  }

  return {
    name: split.name,
    nameEn: null,
    nameHe: null,
    amount,
    unit: split.fact.canonical,
    system: split.fact.system,
    note: null,
  };
}

function bareIngredient({ name, amount = null }: { name: string; amount?: number | null }): Ingredient {
  return {
    name,
    nameEn: null,
    nameHe: null,
    amount,
    unit: null,
    system: "none",
    note: null,
  };
}

function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(trimmed);

  if (mixed?.[1] && mixed[2] && mixed[3]) {
    const denominator = Number(mixed[3]);

    if (denominator === 0) {
      return null;
    }

    return Number(mixed[1]) + Number(mixed[2]) / denominator;
  }

  const fraction = /^(\d+)\/(\d+)$/.exec(trimmed);

  if (fraction?.[1] && fraction[2]) {
    const denominator = Number(fraction[2]);

    if (denominator === 0) {
      return null;
    }

    return Number(fraction[1]) / denominator;
  }

  if (/^\d{1,3}(,\d{3})+$/.test(trimmed)) {
    return Number(trimmed.replaceAll(",", ""));
  }

  const value = Number(trimmed.replace(",", "."));

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}
