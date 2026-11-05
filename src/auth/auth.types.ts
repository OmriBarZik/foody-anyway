import type { HouseholdRow } from "../db/db.types";
import type { FoodyAuth } from "./create-foody-auth";

/** The Better Auth user, including locale, measurement, and the admin flag. */
export type FoodyUser = NonNullable<Awaited<ReturnType<FoodyAuth["api"]["getSession"]>>>["user"];

/** The signed-in person and the one kitchen they belong to. */
export type CurrentUser = {
  user: FoodyUser;
  household: HouseholdRow;
};
