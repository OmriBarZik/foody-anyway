import type { Db } from "../db/db.types";
import type { FoodyAuth } from "../auth/create-foody-auth";
import type { Locale } from "../domain/domain.types";
import { jsonError } from "../http/json-error";
import { readJson } from "../http/request";
import { requireUser } from "../http/require-user";
import { answerGuess, nextGuess } from "./guess";
import { readGuessAnswer } from "./read-guess";

/** The next ingredient card for this kitchen. */
export async function getGuess({
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

  return Response.json(
    await nextGuess({ db, householdId: current.household.id, locale: asLocale(current.user.locale) }),
  );
}

/** Save a swipe and return the following card. */
export async function postGuess({
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

  const answer = readGuessAnswer(await readJson(request));

  if (!answer) {
    return jsonError({ status: 400, code: "bad_item" });
  }

  const deck = await answerGuess({
    db,
    householdId: current.household.id,
    locale: asLocale(current.user.locale),
    stapleEn: answer.stapleEn,
    decision: answer.decision,
  });

  if (!deck) {
    return jsonError({ status: 400, code: "bad_item" });
  }

  return Response.json(deck);
}

function asLocale(value: string | null | undefined): Locale {
  if (value === "he") {
    return "he";
  }

  return "en";
}
