import type { Db } from "../db/db.types";
import type { FoodyAuth } from "../auth/create-foody-auth";
import type { Locale } from "../domain/domain.types";
import { requireUser } from "../http/require-user";
import { readProfile } from "../profile/profile";
import { suggestionMix } from "./suggestions";

/** Saved recipes this person can cook from the shared kitchen. */
export async function getSuggestions({
  request,
  db,
  auth,
}: {
  request: Request;
  db: Db;
  auth: FoodyAuth;
}): Promise<Response> {
  const current = await requireUser({ auth, db, request });

  if (current instanceof Response) {
    return current;
  }

  const locale = asLocale(current.user.locale);

  return Response.json(
    await suggestionMix({
      db,
      householdId: current.household.id,
      locale,
      profile: await readProfile({ db, userId: current.user.id }),
    }),
  );
}

function asLocale(value: string | null | undefined): Locale {
  if (value === "he") {
    return "he";
  }

  return "en";
}
