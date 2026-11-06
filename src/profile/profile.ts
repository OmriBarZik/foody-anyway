import type { Db } from "../db/db.types";
import type { BudgetChoice, DietaryProfile, DietChoice, ProfileRow } from "./profile.types";

const EMPTY_PROFILE: DietaryProfile = {
  allergies: [],
  diet: null,
  dislikes: [],
  maxMinutes: null,
  budget: null,
  interests: [],
};

/** The saved profile, or an empty one when this person has not edited it yet. */
export async function readProfile({ db, userId }: { db: Db; userId: string }): Promise<DietaryProfile> {
  const row = await db.query<ProfileRow>("SELECT * FROM dietary_profiles WHERE user_id = ?").get(userId);

  if (!row) {
    return EMPTY_PROFILE;
  }

  return {
    allergies: readList(row.allergies_json),
    diet: asDiet(row.diet),
    dislikes: readList(row.dislikes_json),
    maxMinutes: row.max_minutes,
    budget: asBudget(row.budget),
    interests: readList(row.interests_json),
  };
}

/** Replace the whole profile. The form always sends every field. */
export async function saveProfile({
  db,
  userId,
  profile,
}: {
  db: Db;
  userId: string;
  profile: DietaryProfile;
}): Promise<DietaryProfile> {
  await db
    .query(
      `INSERT INTO dietary_profiles (
      user_id, allergies_json, diet, dislikes_json, max_minutes, budget, interests_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET
      allergies_json = excluded.allergies_json,
      diet = excluded.diet,
      dislikes_json = excluded.dislikes_json,
      max_minutes = excluded.max_minutes,
      budget = excluded.budget,
      interests_json = excluded.interests_json,
      updated_at = excluded.updated_at`,
    )
    .run(
      userId,
      JSON.stringify(profile.allergies),
      profile.diet,
      JSON.stringify(profile.dislikes),
      profile.maxMinutes,
      profile.budget,
      JSON.stringify(profile.interests),
      new Date().toISOString(),
    );

  return readProfile({ db, userId });
}

function readList(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    // A damaged row should show empty lists instead of taking down the profile screen.
    return [];
  }
}

function asDiet(value: string | null): DietChoice | null {
  if (
    value === "omnivore" ||
    value === "vegetarian" ||
    value === "vegan" ||
    value === "pescatarian" ||
    value === "kosher" ||
    value === "halal"
  ) {
    return value;
  }

  return null;
}

function asBudget(value: string | null): BudgetChoice | null {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return null;
}
