import type { Db } from "../db/db.types";

/** Longest kitchen name the app accepts. */
export const KITCHEN_NAME_MAX_LENGTH = 60;

/** Rename a kitchen. Only its owner may. Returns false when the person is not the owner. */
export async function renameHousehold({
  db,
  householdId,
  userId,
  name,
}: {
  db: Db;
  householdId: string;
  userId: string;
  name: string;
}): Promise<boolean> {
  const membership = await db
    .query<{ role: string }>("SELECT role FROM memberships WHERE user_id = ? AND household_id = ?")
    .get(userId, householdId);

  if (membership?.role !== "owner") {
    return false;
  }

  await db.query("UPDATE households SET name = ? WHERE id = ?").run(name, householdId);

  return true;
}
