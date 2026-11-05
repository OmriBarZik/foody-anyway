import type { Database } from "bun:sqlite";
import type { GoogleProfile, Locale, MeasurementSystem } from "../domain/domain.types";
import type { HouseholdRow, UserRow } from "./db.types";
import { createHouseholdForUser, findHouseholdForUser } from "./households";

/** Find a person by the Google subject id. */
export function findUserByGoogleId({ db, googleId }: { db: Database; googleId: string }): UserRow | null {
  return db.query<UserRow, [string]>("SELECT * FROM users WHERE google_id = ?").get(googleId);
}

/** Find a person by the app id. */
export function findUserById({ db, userId }: { db: Database; userId: string }): UserRow | null {
  return db.query<UserRow, [string]>("SELECT * FROM users WHERE id = ?").get(userId);
}

/**
 * Create the Google user and their own kitchen, or refresh the name and photo.
 * The first account, and any email in adminEmails, is marked admin.
 */
export function upsertGoogleUser({
  db,
  profile,
  adminEmails,
}: {
  db: Database;
  profile: GoogleProfile;
  adminEmails: string[];
}): { user: UserRow; household: HouseholdRow } {
  const save = db.transaction(() => {
    const existing = findUserByGoogleId({ db, googleId: profile.googleId });

    if (existing) {
      db.query<UserRow, [string, string, string | null, string]>(
        "UPDATE users SET name = ?, email = ?, picture_url = ? WHERE id = ?",
      ).run(profile.name, profile.email, profile.pictureUrl, existing.id);
      const user = findUserById({ db, userId: existing.id });
      const household = findHouseholdForUser({ db, userId: existing.id });

      if (!user || !household) {
        throw new Error("This account has no kitchen. Check the database, then sign in again.");
      }

      return { user, household };
    }

    const userCount = db.query<{ count: number }, []>("SELECT COUNT(*) AS count FROM users").get();
    const isFirstAccount = (userCount?.count ?? 0) === 0;
    const isListedAdmin = adminEmails.includes(profile.email.toLowerCase());
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    db.query(
      `INSERT INTO users (
        id, google_id, email, name, picture_url, locale, measurement, is_admin, created_at
      ) VALUES (?, ?, ?, ?, ?, 'en', 'metric', ?, ?)`,
    ).run(
      userId,
      profile.googleId,
      profile.email,
      profile.name,
      profile.pictureUrl,
      isFirstAccount || isListedAdmin ? 1 : 0,
      createdAt,
    );
    const household = createHouseholdForUser({ db, userId, name: profile.name });
    const user = findUserById({ db, userId });

    if (!user) {
      throw new Error("The new account was not saved. Try signing in again.");
    }

    return { user, household };
  });

  return save();
}

/** Update the language or measurement system for one person. */
export function updateUserSettings({
  db,
  userId,
  locale,
  measurement,
}: {
  db: Database;
  userId: string;
  locale: Locale | null;
  measurement: MeasurementSystem | null;
}): UserRow | null {
  db.query("UPDATE users SET locale = COALESCE(?, locale), measurement = COALESCE(?, measurement) WHERE id = ?").run(
    locale,
    measurement,
    userId,
  );

  return findUserById({ db, userId });
}
