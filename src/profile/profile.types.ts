/** A diet the suggestions can filter on. Kosher and halal are name checks, not certifications. */
export type DietChoice = "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "kosher" | "halal";

/** How tightly suggestions prefer recipes the kitchen can already make. */
export type BudgetChoice = "low" | "medium" | "high";

/** Food preferences for one person. They do not change the shared kitchen. */
export type DietaryProfile = {
  allergies: string[];
  diet: DietChoice | null;
  dislikes: string[];
  maxMinutes: number | null;
  budget: BudgetChoice | null;
  interests: string[];
};

/** A row in dietary_profiles. Lists are JSON text. */
export type ProfileRow = {
  user_id: string;
  allergies_json: string;
  diet: string | null;
  dislikes_json: string;
  max_minutes: number | null;
  budget: string | null;
  interests_json: string;
  updated_at: string;
};
