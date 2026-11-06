import { ApiError } from "../api";
import type { CostReport } from "../../admin/admin.types";
import type { GuessDeck, GuessDecision } from "../../guess/guess.types";
import type { DietaryProfile } from "../../profile/profile.types";
import type { ShopItemView } from "../../shop/shop.types";
import type { SuggestionMix } from "../../suggest/suggest.types";
import { isRecord } from "../../shared/is-record";

/** The signed-in person's food preferences. */
export async function fetchProfile(): Promise<DietaryProfile> {
  return readOk(await fetch("/api/profile"));
}

/** Replace the food preferences. */
export async function saveProfile(profile: DietaryProfile): Promise<DietaryProfile> {
  return readOk(await fetch("/api/profile", { method: "PUT", headers: jsonHeaders(), body: JSON.stringify(profile) }));
}

/** The next guess card. */
export async function fetchGuess(): Promise<GuessDeck> {
  return readOk(await fetch("/api/guess"));
}

/** Record a swipe and return the next card. */
export async function answerGuess({
  stapleEn,
  decision,
}: {
  stapleEn: string;
  decision: GuessDecision;
}): Promise<GuessDeck> {
  return readOk(
    await fetch("/api/guess", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ stapleEn, decision }) }),
  );
}

/** The shared shopping list. */
export async function fetchShop(): Promise<ShopItemView[]> {
  return readOk(await fetch("/api/shop"));
}

/** Add one shopping line and return the whole list. */
export async function createShopItem(item: {
  name: string;
  amount: number | null;
  unit: string | null;
}): Promise<ShopItemView[]> {
  return readOk(await fetch("/api/shop", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(item) }));
}

/** Add the ingredients a saved recipe still needs. */
export async function shopForRecipe(recipeId: string): Promise<ShopItemView[]> {
  return readOk(
    await fetch("/api/shop", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ recipeId }) }),
  );
}

/** Remove one shopping line. */
export async function removeShopItem(itemId: string): Promise<void> {
  const response = await fetch(`/api/shop/${encodeURIComponent(itemId)}`, { method: "DELETE" });

  if (!response.ok) {
    throw new ApiError("save_failed");
  }
}

/** Recipes the kitchen can make, and recipes that need a few items. */
export async function fetchSuggestions(): Promise<SuggestionMix> {
  return readOk(await fetch("/api/suggestions"));
}

/** Extraction costs. Throws not_admin when this account is not the owner. */
export async function fetchCosts(): Promise<CostReport> {
  return readOk(await fetch("/api/costs"));
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

async function readOk<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const code = isRecord(body) && typeof body.error === "string" ? body.error : "save_failed";
    throw new ApiError(code);
  }

  return body as T;
}
