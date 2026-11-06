import type { StockLocation } from "../domain/domain.types";

/** Which way a guess card was swiped. */
export type GuessDecision = "have" | "skip";

/** One proposed staple, named in the viewer's language. */
export type GuessCard = {
  stapleEn: string;
  name: string;
  location: StockLocation;
  unit: string | null;
};

/** The next card, and how many cards are still unseen. */
export type GuessDeck = {
  card: GuessCard | null;
  remaining: number;
};

/** A swipe of one catalog card. */
export type GuessAnswer = {
  stapleEn: string;
  decision: GuessDecision;
};

/** A row in stock_passes. staple_en is the catalog key, not the translated label. */
export type StockPassRow = {
  household_id: string;
  staple_en: string;
  decision: string;
};
