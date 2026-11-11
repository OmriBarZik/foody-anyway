import type { Db } from "../db/db.types";
import type { MemberRow, MemberView } from "./household.types";

/** Everyone in one kitchen, owners first, then in the order they joined. */
export async function listMembers({ db, householdId }: { db: Db; householdId: string }): Promise<MemberView[]> {
  const rows = await db
    .query<MemberRow>(
      `SELECT "user".id, "user".name, "user".image, memberships.role
       FROM memberships
       JOIN "user" ON "user".id = memberships.user_id
       WHERE memberships.household_id = ?
       ORDER BY CASE WHEN memberships.role = 'owner' THEN 0 ELSE 1 END, memberships.created_at`,
    )
    .all(householdId);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    pictureUrl: row.image,
    role: row.role === "owner" ? "owner" : "member",
  }));
}
