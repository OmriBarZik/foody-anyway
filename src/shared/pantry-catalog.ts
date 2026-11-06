import type { PantryStaple } from "./pantry.types";

/** Staples a household is likely to have. Guess mode walks this list once. */
export const PANTRY_STAPLES: PantryStaple[] = [
  { en: "milk", he: "חלב", location: "fridge", unit: "L" },
  { en: "eggs", he: "ביצים", location: "fridge", unit: "pcs" },
  { en: "butter", he: "חמאה", location: "fridge", unit: "g" },
  { en: "yogurt", he: "יוגורט", location: "fridge", unit: "g" },
  { en: "cheese", he: "גבינה", location: "fridge", unit: "g" },
  { en: "chicken", he: "עוף", location: "fridge", unit: "g" },
  { en: "tomatoes", he: "עגבניות", location: "fridge", unit: "pcs" },
  { en: "cucumber", he: "מלפפון", location: "fridge", unit: "pcs" },
  { en: "lemon", he: "לימון", location: "fridge", unit: "pcs" },
  { en: "onion", he: "בצל", location: "fridge", unit: "pcs" },
  { en: "garlic", he: "שום", location: "fridge", unit: "pcs" },
  { en: "carrots", he: "גזר", location: "fridge", unit: "pcs" },
  { en: "lettuce", he: "חסה", location: "fridge", unit: "pcs" },
  { en: "apples", he: "תפוחים", location: "fridge", unit: "pcs" },
  { en: "frozen peas", he: "אפונה קפואה", location: "freezer", unit: "g" },
  { en: "ground beef", he: "בשר טחון", location: "freezer", unit: "g" },
  { en: "shrimp", he: "שרימפס", location: "freezer", unit: "g" },
  { en: "ice cream", he: "גלידה", location: "freezer", unit: "L" },
  { en: "bread", he: "לחם", location: "pantry", unit: "pcs" },
  { en: "rice", he: "אורז", location: "pantry", unit: "g" },
  { en: "pasta", he: "פסטה", location: "pantry", unit: "g" },
  { en: "flour", he: "קמח", location: "pantry", unit: "g" },
  { en: "sugar", he: "סוכר", location: "pantry", unit: "g" },
  { en: "olive oil", he: "שמן זית", location: "pantry", unit: "L" },
  { en: "canned tomatoes", he: "עגבניות משומרות", location: "pantry", unit: "pcs" },
  { en: "beans", he: "שעועית", location: "pantry", unit: "g" },
  { en: "oats", he: "שיבולת שועל", location: "pantry", unit: "g" },
  { en: "honey", he: "דבש", location: "pantry", unit: "g" },
  { en: "soy sauce", he: "רוטב סויה", location: "pantry", unit: "L" },
  { en: "salt", he: "מלח", location: "spices", unit: null },
  { en: "black pepper", he: "פלפל שחור", location: "spices", unit: null },
  { en: "cumin", he: "כמון", location: "spices", unit: null },
  { en: "paprika", he: "פפריקה", location: "spices", unit: null },
  { en: "cinnamon", he: "קינמון", location: "spices", unit: null },
  { en: "oregano", he: "אורגנו", location: "spices", unit: null },
  { en: "chili flakes", he: "פתיתי צ'ילי", location: "spices", unit: null },
];

/** The catalog entry for an English staple name, if the deck knows it. */
export function findStaple(stapleEn: string): PantryStaple | null {
  return PANTRY_STAPLES.find((staple) => staple.en === stapleEn) ?? null;
}
