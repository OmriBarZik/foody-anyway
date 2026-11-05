import type { CurrentUser } from "../auth/auth.types";
import type { Locale, MeasurementSystem, UserView } from "../domain/domain.types";

/** The account payload the shell renders. */
export function toUserView({ user, household }: CurrentUser): UserView {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    pictureUrl: user.image ?? null,
    locale: asLocale(user.locale),
    measurement: asMeasurement(user.measurement),
    isAdmin: user.isAdmin === true,
    household: { id: household.id, name: household.name },
  };
}

function asLocale(value: string | null | undefined): Locale {
  if (value === "he") {
    return "he";
  }

  return "en";
}

function asMeasurement(value: string | null | undefined): MeasurementSystem {
  if (value === "imperial") {
    return "imperial";
  }

  return "metric";
}
