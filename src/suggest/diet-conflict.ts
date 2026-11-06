import type { DietChoice } from "../profile/profile.types";
import { mentionsFood } from "../shared/food";

const MEAT = [
  "chicken",
  "beef",
  "pork",
  "lamb",
  "turkey",
  "bacon",
  "sausage",
  "steak",
  "ham",
  "עוף",
  "בקר",
  "חזיר",
  "כבש",
  "הודו",
  "בשר",
];
const FISH = ["fish", "salmon", "tuna", "shrimp", "prawn", "cod", "crab", "דג", "סלמון", "טונה", "שרימפס"];
const DAIRY = ["milk", "cheese", "butter", "cream", "yogurt", "חלב", "גבינה", "חמאה", "שמנת", "יוגורט"];
const EGGS = ["egg", "eggs", "ביצה", "ביצים"];
const PORK = ["pork", "bacon", "ham", "חזיר"];
const SHELLFISH = ["shrimp", "prawn", "crab", "lobster", "שרימפס", "סרטן"];

/** True when a diet choice conflicts with these ingredient names. Omnivore never conflicts. */
export function dietBlocks({ diet, names }: { diet: DietChoice | null; names: string[] }): boolean {
  if (!diet || diet === "omnivore") {
    return false;
  }

  if (diet === "vegetarian") {
    return mentionsFood({ names, words: [...MEAT, ...FISH] });
  }

  if (diet === "vegan") {
    return mentionsFood({ names, words: [...MEAT, ...FISH, ...DAIRY, ...EGGS] });
  }

  if (diet === "pescatarian") {
    return mentionsFood({ names, words: MEAT });
  }

  return mentionsFood({ names, words: [...PORK, ...SHELLFISH] });
}
