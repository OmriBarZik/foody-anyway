import type { StockItemView, StockLocation } from "../domain/domain.types";
import type { Db, StockDraft, StockRow } from "./db.types";

/** Everything currently in one kitchen, grouped later by location. */
export async function listStock({ db, householdId }: { db: Db; householdId: string }): Promise<StockItemView[]> {
  const rows = await db
    .query<StockRow>(`SELECT * FROM stock_items WHERE household_id = ? ORDER BY location, lower(name)`)
    .all(householdId);

  return rows.map(toView);
}

/** Add one item. The caller has already checked the location rules. */
export async function insertStock({
  db,
  householdId,
  draft,
}: {
  db: Db;
  householdId: string;
  draft: StockDraft;
}): Promise<StockItemView> {
  const id = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  await db
    .query(
      `INSERT INTO stock_items (id, household_id, location, name, amount, unit, present, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, householdId, draft.location, draft.name, draft.amount, draft.unit, presentValue(draft.present), updatedAt);
  const saved = await findStock({ db, householdId, itemId: id });

  if (!saved) {
    throw new Error("The kitchen item was not saved. Try adding it again.");
  }

  return saved;
}

/** Replace the editable fields of one item in this kitchen. */
export async function updateStock({
  db,
  householdId,
  itemId,
  draft,
}: {
  db: Db;
  householdId: string;
  itemId: string;
  draft: StockDraft;
}): Promise<StockItemView | null> {
  const updatedAt = new Date().toISOString();
  const result = await db
    .query(
      `UPDATE stock_items
       SET location = ?, name = ?, amount = ?, unit = ?, present = ?, updated_at = ?
       WHERE id = ? AND household_id = ?`,
    )
    .run(
      draft.location,
      draft.name,
      draft.amount,
      draft.unit,
      presentValue(draft.present),
      updatedAt,
      itemId,
      householdId,
    );

  if (result.changes === 0) {
    return null;
  }

  return findStock({ db, householdId, itemId });
}

/** Remove one item from this kitchen. */
export async function deleteStock({
  db,
  householdId,
  itemId,
}: {
  db: Db;
  householdId: string;
  itemId: string;
}): Promise<boolean> {
  const result = await db.query("DELETE FROM stock_items WHERE id = ? AND household_id = ?").run(itemId, householdId);

  return result.changes > 0;
}

async function findStock({
  db,
  householdId,
  itemId,
}: {
  db: Db;
  householdId: string;
  itemId: string;
}): Promise<StockItemView | null> {
  const row = await db
    .query<StockRow>("SELECT * FROM stock_items WHERE id = ? AND household_id = ?")
    .get(itemId, householdId);

  if (!row) {
    return null;
  }

  return toView(row);
}

function toView(row: StockRow): StockItemView {
  return {
    id: row.id,
    location: row.location as StockLocation,
    name: row.name,
    amount: row.amount,
    unit: row.unit,
    present: row.present === null ? null : row.present === 1,
  };
}

function presentValue(present: boolean | null): number | null {
  if (present === null) {
    return null;
  }

  return present ? 1 : 0;
}
