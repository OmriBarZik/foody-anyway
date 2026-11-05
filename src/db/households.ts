import type { Database } from "bun:sqlite";
import type { InvitePreview } from "../domain/domain.types";
import { randomToken } from "../shared/random-token";
import type { AcceptInviteStatus, HouseholdRow, MembershipRow } from "./db.types";

/** How long an invite link stays valid. */
const INVITE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/** The kitchen a person currently belongs to. */
export function findHouseholdForUser({ db, userId }: { db: Database; userId: string }): HouseholdRow | null {
  return db
    .query<HouseholdRow, [string]>(
      `SELECT households.*
       FROM households
       JOIN memberships ON memberships.household_id = households.id
       WHERE memberships.user_id = ?`,
    )
    .get(userId);
}

/** Create a kitchen and make this person its owner. */
export function createHouseholdForUser({
  db,
  userId,
  name,
}: {
  db: Database;
  userId: string;
  name: string;
}): HouseholdRow {
  const householdId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.query("INSERT INTO households (id, name, created_at) VALUES (?, ?, ?)").run(householdId, name, createdAt);
  db.query("INSERT INTO memberships (user_id, household_id, role, created_at) VALUES (?, ?, 'owner', ?)").run(
    userId,
    householdId,
    createdAt,
  );
  const household = db.query<HouseholdRow, [string]>("SELECT * FROM households WHERE id = ?").get(householdId);

  if (!household) {
    throw new Error("The kitchen was not saved. Try signing in again.");
  }

  return household;
}

/** Create an invite link for the kitchen. */
export function createInvite({
  db,
  householdId,
  userId,
  appOrigin,
}: {
  db: Database;
  householdId: string;
  userId: string;
  appOrigin: string;
}): { url: string } {
  const token = randomToken();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + INVITE_MAX_AGE_MS).toISOString();
  db.query(
    `INSERT INTO invites (id, household_id, token, created_by_user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(crypto.randomUUID(), householdId, token, userId, createdAt, expiresAt);

  return { url: `${appOrigin}/invite/${token}` };
}

/** Kitchen name for a still-valid invite, without accepting it. */
export function findInvitePreview({ db, token }: { db: Database; token: string }): InvitePreview | null {
  const row = db
    .query<{ name: string; expires_at: string }, [string]>(
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
export function acceptInvite({
  db,
  userId,
  token,
}: {
  db: Database;
  userId: string;
  token: string;
}): AcceptInviteStatus {
  const accept = db.transaction(() => {
    const invite = db
      .query<{ household_id: string; expires_at: string }, [string]>(
        "SELECT household_id, expires_at FROM invites WHERE token = ?",
      )
      .get(token);

    if (!invite || invite.expires_at < new Date().toISOString()) {
      return "missing" as const;
    }

    const current = findHouseholdForUser({ db, userId });

    if (current?.id === invite.household_id) {
      return "already" as const;
    }

    if (current && !kitchenIsEmpty({ db, householdId: current.id, userId })) {
      return "conflict" as const;
    }

    const createdAt = new Date().toISOString();
    db.query("INSERT INTO memberships (user_id, household_id, role, created_at) VALUES (?, ?, 'member', ?)").run(
      userId,
      invite.household_id,
      createdAt,
    );

    if (current) {
      db.query("DELETE FROM households WHERE id = ?").run(current.id);
    }

    return "joined" as const;
  });

  return accept();
}

function kitchenIsEmpty({ db, householdId, userId }: { db: Database; householdId: string; userId: string }): boolean {
  const recipes = db
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM recipes WHERE household_id = ?")
    .get(householdId);
  const members = db
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM memberships WHERE household_id = ?")
    .get(householdId);
  const membership = db
    .query<MembershipRow, [string, string]>("SELECT * FROM memberships WHERE user_id = ? AND household_id = ?")
    .get(userId, householdId);

  if (!membership) {
    return false;
  }

  return (recipes?.count ?? 0) === 0 && (members?.count ?? 0) === 1;
}
