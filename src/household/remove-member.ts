import type { Db } from "../db/db.types";
import type { RemoveMemberStatus } from "./household.types";

/**
 * Take one person out of a kitchen. People can always remove themselves; only the owner can remove others.
 * When the owner leaves, the longest-standing member becomes owner. The last person leaving deletes the kitchen.
 * The removed person gets a fresh empty kitchen the next time they sign in.
 */
export async function removeMember({
  db,
  householdId,
  actorUserId,
  targetUserId,
}: {
  db: Db;
  householdId: string;
  actorUserId: string;
  targetUserId: string;
}): Promise<RemoveMemberStatus> {
  return db.transaction(async (tx) => {
    const members = await tx
      .query<{ user_id: string; role: string }>(
        "SELECT user_id, role FROM memberships WHERE household_id = ? ORDER BY created_at",
      )
      .all(householdId);
    const actor = members.find((member) => member.user_id === actorUserId);
    const target = members.find((member) => member.user_id === targetUserId);

    if (!actor || !target) {
      return "missing";
    }

    const leaving = actorUserId === targetUserId;

    if (!leaving && actor.role !== "owner") {
      return "forbidden";
    }

    const others = members.filter((member) => member.user_id !== targetUserId);

    if (others.length === 0) {
      await tx.query("DELETE FROM households WHERE id = ?").run(householdId);

      return "left";
    }

    await tx.query("DELETE FROM memberships WHERE user_id = ? AND household_id = ?").run(targetUserId, householdId);

    if (target.role === "owner") {
      await tx
        .query("UPDATE memberships SET role = 'owner' WHERE user_id = ? AND household_id = ?")
        .run(others[0]!.user_id, householdId);
    }

    return leaving ? "left" : "removed";
  });
}
