import { isRecord } from "../shared/is-record";
import type { BudgetChoice, DietaryProfile, DietChoice } from "./profile.types";

/** Parse a full profile. Returns null when a field is the wrong shape. */
export function readProfileDraft(body: unknown): DietaryProfile | null {
  if (!isRecord(body)) {
    return null;
  }

  const allergies = readList(body.allergies);
  const dislikes = readList(body.dislikes);
  const interests = readList(body.interests);
  const diet = readDiet(body.diet);
  const budget = readBudget(body.budget);
  const maxMinutes = readMinutes(body.maxMinutes);

  if (!allergies || !dislikes || !interests || diet === undefined || budget === undefined || maxMinutes === undefined) {
    return null;
  }

  return { allergies, diet, dislikes, maxMinutes, budget, interests };
}

function readList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 40);

  if (items.length > 30) {
    return null;
  }

  return items;
}

function readDiet(value: unknown): DietChoice | null | undefined {
  if (value === null) {
    return null;
  }

  if (
    value === "omnivore" ||
    value === "vegetarian" ||
    value === "vegan" ||
    value === "pescatarian" ||
    value === "kosher" ||
    value === "halal"
  ) {
    return value;
  }

  return undefined;
}

function readBudget(value: unknown): BudgetChoice | null | undefined {
  if (value === null) {
    return null;
  }

  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function readMinutes(value: unknown): number | null | undefined {
  if (value === null || value === "") {
    return null;
  }

  const minutes = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
    return undefined;
  }

  return minutes;
}
