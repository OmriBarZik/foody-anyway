import type { InvitePreview } from "../domain/domain.types";
import { randomToken } from "../shared/random-token";
import type { AcceptInviteStatus, Db, HouseholdRow, InviteLink, MembershipRow } from "./db.types";

/** How long an invite link stays valid. */
const INVITE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/** The kitchen a person currently belongs to. */
export async function findHouseholdForUser({ db, userId }: { db: Db; userId: string }): Promise<HouseholdRow | null> {
  return db
    .query<HouseholdRow>(
      `SELECT households.*
       FROM households
       JOIN memberships ON memberships.household_id = households.id
       WHERE memberships.user_id = ?`,
    )
    .get(userId);
}

/** Create a kitchen and make this person its owner. */
export async function createHouseholdForUser({
  db,
  userId,
  name,
}: {
  db: Db;
  userId: string;
  name: string;
}): Promise<HouseholdRow> {
  const householdId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.query("INSERT INTO households (id, name, created_at) VALUES (?, ?, ?)").run(householdId, name, createdAt);
  await db
    .query("INSERT INTO memberships (user_id, household_id, role, created_at) VALUES (?, ?, 'owner', ?)")
    .run(userId, householdId, createdAt);
  const household = await db.query<HouseholdRow>("SELECT * FROM households WHERE id = ?").get(householdId);

  if (!household) {
    throw new Error("The kitchen was not saved. Try signing in again.");
  }

  return household;
}

/** Create an invite link for the kitchen. */
export async function createInvite({
  db,
  householdId,
  userId,
  appOrigin,
}: {
  db: Db;
  householdId: string;
  userId: string;
  appOrigin: string;
}): Promise<InviteLink> {
  const token = randomToken();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + INVITE_MAX_AGE_MS).toISOString();
  await db
    .query(
      `INSERT INTO invites (id, household_id, token, created_by_user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(crypto.randomUUID(), householdId, token, userId, createdAt, expiresAt);

  return { url: `${appOrigin}/invite/${token}` };
}

/** Kitchen name for a still-valid invite, without accepting it. */
export async function findInvitePreview({ db, token }: { db: Db; token: string }): Promise<InvitePreview | null> {
  const row = await db
    .query<{ name: string; expires_at: string }>(
      `SELECT households.name AS name, invites.expires_at AS expires_at
       FROM invites
       JOIN households ON households.id = invites.household_id
       WHERE invites.token = ?`,
    )
    .get(token);

  if (!row || row.expires_at < new Date().toISOString()) {
    return null;
  }

  return { householdName: row.name };
}

/**
 * Move a person into the invited kitchen when their current kitchen is empty
 * and they are its only member. A kitchen that already has food or people stays put.
 */
export async function acceptInvite({
  db,
  userId,
  token,
}: {
  db: Db;
  userId: string;
  token: string;
}): Promise<AcceptInviteStatus> {
  return db.transaction(async (tx) => {
    const invite = await tx
      .query<{ household_id: string; expires_at: string }>(
        "SELECT household_id, expires_at FROM invites WHERE token = ?",
      )
      .get(token);

    if (!invite || invite.expires_at < new Date().toISOString()) {
      return "missing";
    }

    const current = await findHouseholdForUser({ db: tx, userId });

    if (current?.id === invite.household_id) {
      return "already";
    }

    if (current && !(await kitchenIsEmpty({ db: tx, householdId: current.id, userId }))) {
      return "conflict";
    }

    const createdAt = new Date().toISOString();
    await tx
      .query("INSERT INTO memberships (user_id, household_id, role, created_at) VALUES (?, ?, 'member', ?)")
      .run(userId, invite.household_id, createdAt);

    if (current) {
      await tx.query("DELETE FROM households WHERE id = ?").run(current.id);
    }

    return "joined";
  });
}

async function kitchenIsEmpty({
  db,
  householdId,
  userId,
}: {
  db: Db;
  householdId: string;
  userId: string;
}): Promise<boolean> {
  const recipes = await db
    .query<{ count: number }>("SELECT COUNT(*)::int AS count FROM recipes WHERE household_id = ?")
    .get(householdId);
  const members = await db
    .query<{ count: number }>("SELECT COUNT(*)::int AS count FROM memberships WHERE household_id = ?")
    .get(householdId);
  const membership = await db
    .query<MembershipRow>("SELECT * FROM memberships WHERE user_id = ? AND household_id = ?")
    .get(userId, householdId);

  if (!membership) {
    return false;
  }

  return Number(recipes?.count ?? 0) === 0 && Number(members?.count ?? 0) === 1;
}
