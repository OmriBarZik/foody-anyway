import { isRecord } from "../shared/is-record";
import { findStaple } from "../shared/pantry-catalog";
import type { GuessAnswer } from "./guess.types";

/** Parse a guess swipe. Returns null when the staple is not in the deck. */
export function readGuessAnswer(body: unknown): GuessAnswer | null {
  if (!isRecord(body) || typeof body.stapleEn !== "string" || !findStaple(body.stapleEn)) {
    return null;
  }

  if (body.decision !== "have" && body.decision !== "skip") {
    return null;
  }

  return { stapleEn: body.stapleEn, decision: body.decision };
}
