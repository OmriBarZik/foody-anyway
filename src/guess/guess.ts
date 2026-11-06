import type { Db } from "../db/db.types";
import type { Locale } from "../domain/domain.types";
import { insertStock, listStock } from "../db/stock";
import { sameFood } from "../shared/food";
import { PANTRY_STAPLES, findStaple } from "../shared/pantry-catalog";
import type { PantryStaple } from "../shared/pantry.types";
import type { GuessCard, GuessDeck, GuessDecision, StockPassRow } from "./guess.types";

/** The next staple this kitchen has not swiped and does not already hold. */
export async function nextGuess({
  db,
  householdId,
  locale,
}: {
  db: Db;
  householdId: string;
  locale: Locale;
}): Promise<GuessDeck> {
  const waiting = await waitingStaples({ db, householdId });
  const staple = waiting[0] ?? null;

  return {
    card: staple ? toCard({ staple, locale }) : null,
    remaining: waiting.length,
  };
}

/** Record a swipe. "have" adds the staple when the kitchen does not already list it. */
export async function answerGuess({
  db,
  householdId,
  locale,
  stapleEn,
  decision,
}: {
  db: Db;
  householdId: string;
  locale: Locale;
  stapleEn: string;
  decision: GuessDecision;
}): Promise<GuessDeck | null> {
  const staple = findStaple(stapleEn);

  if (!staple) {
    return null;
  }

  if (decision === "have") {
    await addStaple({ db, householdId, locale, staple });
  }

  await db
    .query(
      `INSERT INTO stock_passes (household_id, staple_en, decision) VALUES (?, ?, ?)
     ON CONFLICT (household_id, staple_en) DO UPDATE SET decision = excluded.decision`,
    )
    .run(householdId, staple.en, decision);

  return nextGuess({ db, householdId, locale });
}

async function waitingStaples({ db, householdId }: { db: Db; householdId: string }): Promise<PantryStaple[]> {
  const passes = await listPasses({ db, householdId });
  const passed = new Set(passes.map((row) => row.staple_en));
  const stock = await listStock({ db, householdId });

  return PANTRY_STAPLES.filter((staple) => {
    if (passed.has(staple.en)) {
      return false;
    }

    return !stock.some((item) => sameFood(item.name, staple.en) || sameFood(item.name, staple.he));
  });
}

async function addStaple({
  db,
  householdId,
  locale,
  staple,
}: {
  db: Db;
  householdId: string;
  locale: Locale;
  staple: PantryStaple;
}): Promise<void> {
  const spice = staple.location === "spices";
  await insertStock({
    db,
    householdId,
    draft: {
      location: staple.location,
      name: locale === "he" ? staple.he : staple.en,
      amount: spice ? null : 1,
      unit: spice ? null : staple.unit,
      present: spice ? true : null,
    },
  });
}

async function listPasses({ db, householdId }: { db: Db; householdId: string }): Promise<StockPassRow[]> {
  return db.query<StockPassRow>("SELECT * FROM stock_passes WHERE household_id = ?").all(householdId);
}

function toCard({ staple, locale }: { staple: PantryStaple; locale: Locale }): GuessCard {
  return {
    stapleEn: staple.en,
    name: locale === "he" ? staple.he : staple.en,
    location: staple.location,
    unit: staple.unit,
  };
}
