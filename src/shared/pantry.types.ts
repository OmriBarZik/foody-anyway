import type { StockLocation } from "../domain/domain.types";

/** A staple the guess deck can propose, named in both UI languages. */
export type PantryStaple = {
  en: string;
  he: string;
  location: StockLocation;
  unit: string | null;
};
