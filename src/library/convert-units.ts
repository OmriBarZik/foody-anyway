import type { DisplayAmount, Ingredient, Locale, MeasurementSystem } from "../domain/domain.types";
import type { CanonicalUnit, SplitUnit, UnitFact } from "./library.types";

const UNIT_FACTS: { words: string[]; fact: UnitFact }[] = [
  {
    words: ["fl oz", "floz", "fluid ounce", "fluid ounces"],
    fact: { canonical: "floz", system: "imperial", base: "ml", factor: 29.5735 },
  },
  {
    words: ["kg", "kilogram", "kilograms", "kilo", "קג", 'ק"ג', "ק״ג", "קילו"],
    fact: { canonical: "kg", system: "metric", base: "g", factor: 1000 },
  },
  { words: ["g", "gram", "grams", "גרם", "גרמים"], fact: { canonical: "g", system: "metric", base: "g", factor: 1 } },
  {
    words: ["ml", "milliliter", "milliliters", "millilitre", "millilitres", "מל", 'מ"ל', "מ״ל", "מיליליטר"],
    fact: { canonical: "ml", system: "metric", base: "ml", factor: 1 },
  },
  {
    words: ["l", "liter", "liters", "litre", "litres", "ליטר"],
    fact: { canonical: "l", system: "metric", base: "ml", factor: 1000 },
  },
  {
    words: ["lb", "lbs", "pound", "pounds", "ליברה"],
    fact: { canonical: "lb", system: "imperial", base: "g", factor: 453.592 },
  },
  {
    words: ["oz", "ounce", "ounces", "אונקיה", "אונקיות"],
    fact: { canonical: "oz", system: "imperial", base: "g", factor: 28.3495 },
  },
  {
    words: ["tbsp", "tablespoon", "tablespoons", "כף", "כפות"],
    fact: { canonical: "tbsp", system: "imperial", base: "ml", factor: 14.7868 },
  },
  {
    words: ["tsp", "teaspoon", "teaspoons", "כפית", "כפיות"],
    fact: { canonical: "tsp", system: "imperial", base: "ml", factor: 4.92892 },
  },
  {
    words: ["cup", "cups", "כוס", "כוסות"],
    fact: { canonical: "cup", system: "imperial", base: "ml", factor: 236.588 },
  },
];

const BY_WORD = new Map<string, UnitFact>();

for (const entry of UNIT_FACTS) {
  for (const word of entry.words) {
    BY_WORD.set(normalizeWord(word), entry.fact);
  }
}

const GRAM_PER_OUNCE = 28.3495;
const ML_PER_TSP = 4.92892;
const ML_PER_TBSP = 14.7868;
const ML_PER_CUP = 236.588;

/** Pull a known unit off the front of the rest of an ingredient line. */
export function splitLeadingUnit(rest: string): SplitUnit | null {
  const parts = rest.trim().split(/\s+/);
  const first = parts[0];

  if (!first) {
    return null;
  }

  const second = parts[1];
  const pair = second ? findFact(`${first} ${second}`) : null;

  if (pair) {
    return { fact: pair, name: parts.slice(2).join(" ") };
  }

  const single = findFact(first);

  if (!single) {
    return null;
  }

  return { fact: single, name: parts.slice(1).join(" ") };
}

/** Metric or imperial, based on the units that were actually parsed. */
export function measurementOf(ingredients: Ingredient[]): Ingredient["system"] | "mixed" | null {
  const systems = new Set(ingredients.map((ingredient) => ingredient.system).filter((system) => system !== "none"));

  if (systems.size === 0) {
    return null;
  }

  if (systems.size > 1) {
    return "mixed";
  }

  return [...systems][0] ?? null;
}

/** Amount and name in the viewer's language and measurement system. */
export function displayIngredient({
  ingredient,
  preference,
  locale,
}: {
  ingredient: Ingredient;
  preference: MeasurementSystem;
  locale: Locale;
}): DisplayAmount {
  const name = ingredientName({ ingredient, locale });

  if (ingredient.amount === null) {
    return { amountLabel: null, name };
  }

  const fact = ingredient.unit ? findFact(ingredient.unit) : null;

  if (!fact || fact.system === preference) {
    return {
      amountLabel: joinAmount({ amount: ingredient.amount, unit: fact?.canonical ?? ingredient.unit, locale }),
      name,
    };
  }

  const converted = fromBase({ base: fact.base, value: ingredient.amount * fact.factor, preference });

  return { amountLabel: joinAmount({ amount: converted.amount, unit: converted.unit, locale }), name };
}

function ingredientName({ ingredient, locale }: { ingredient: Ingredient; locale: Locale }): string {
  if (locale === "he") {
    return ingredient.nameHe ?? ingredient.name;
  }

  return ingredient.nameEn ?? ingredient.name;
}

function fromBase({ base, value, preference }: { base: "g" | "ml"; value: number; preference: MeasurementSystem }): {
  amount: number;
  unit: CanonicalUnit;
} {
  if (base === "g" && preference === "metric") {
    if (value >= 1000) {
      return { amount: value / 1000, unit: "kg" };
    }

    return { amount: value, unit: "g" };
  }

  if (base === "g") {
    const ounces = value / GRAM_PER_OUNCE;

    if (ounces >= 16) {
      return { amount: ounces / 16, unit: "lb" };
    }

    return { amount: ounces, unit: "oz" };
  }

  if (preference === "metric") {
    if (value >= 1000) {
      return { amount: value / 1000, unit: "l" };
    }

    return { amount: value, unit: "ml" };
  }

  if (value >= ML_PER_CUP) {
    return { amount: value / ML_PER_CUP, unit: "cup" };
  }

  if (value >= ML_PER_TBSP) {
    return { amount: value / ML_PER_TBSP, unit: "tbsp" };
  }

  return { amount: value / ML_PER_TSP, unit: "tsp" };
}

function joinAmount({ amount, unit, locale }: { amount: number; unit: string | null; locale: Locale }): string {
  const formatted = formatNumber(amount);

  if (!unit) {
    return formatted;
  }

  const fact = findFact(unit);
  const label = fact ? unitLabel({ unit: fact.canonical, amount, locale }) : unit;

  return `${formatted} ${label}`;
}

function unitLabel({ unit, amount, locale }: { unit: CanonicalUnit; amount: number; locale: Locale }): string {
  if (locale === "he") {
    return hebrewLabel(unit);
  }

  if (unit === "cup" && amount !== 1) {
    return "cups";
  }

  if (unit === "l") {
    return "L";
  }

  return unit;
}

function hebrewLabel(unit: CanonicalUnit): string {
  if (unit === "g") {
    return "גרם";
  }

  if (unit === "kg") {
    return "ק״ג";
  }

  if (unit === "ml") {
    return "מ״ל";
  }

  if (unit === "l") {
    return "ליטר";
  }

  if (unit === "tsp") {
    return "כפית";
  }

  if (unit === "tbsp") {
    return "כף";
  }

  if (unit === "cup") {
    return "כוס";
  }

  if (unit === "oz") {
    return "אונקיה";
  }

  if (unit === "lb") {
    return "ליברה";
  }

  return "אונקיה נוזלית";
}

function formatNumber(value: number): string {
  if (value >= 100) {
    return String(Math.round(value));
  }

  if (value >= 10) {
    return trimZero(Math.round(value * 10) / 10);
  }

  return trimZero(Math.round(value * 100) / 100);
}

function trimZero(value: number): string {
  return String(value);
}

function findFact(word: string): UnitFact | null {
  return BY_WORD.get(normalizeWord(word)) ?? null;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replaceAll("״", '"').replaceAll("׳", "'").replaceAll("’", "'");
}
