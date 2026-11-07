/** Why a recipe is being read: a first save or a user asking to try again. */
export type ExtractionTrigger = "save" | "retry";

/** One time a link was read, by a save or by a retry. */
export type AttemptWrite = {
  recipeId: string;
  householdId: string;
  userId: string;
  trigger: ExtractionTrigger;
};

/** How often a person and a kitchen asked to read a video again, and whether this recipe is being read now. */
export type RetryUsage = {
  userRetriesLastMinute: number;
  householdRetriesLastMinute: number;
  userRetriesToday: number;
  householdRetriesToday: number;
  recentAttemptOnRecipe: boolean;
};

/** A row of counts read back from Postgres. */
export type RetryUsageRow = {
  user_retries_minute: number;
  household_retries_minute: number;
  user_retries_today: number;
  household_retries_today: number;
  recent_attempts: number;
};

/** A row in extraction_attempts. */
export type AttemptRow = {
  id: string;
  recipe_id: string;
  household_id: string;
  user_id: string;
  trigger: ExtractionTrigger;
  created_at: Date;
};
