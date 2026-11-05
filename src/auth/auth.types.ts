import type { HouseholdRow, UserRow } from "../db/db.types";

/** The signed-in person and the one kitchen they belong to. */
export type CurrentUser = {
  user: UserRow;
  household: HouseholdRow;
};
