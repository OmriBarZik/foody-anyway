import type { RecipeView } from "../../domain/domain.types";

/** Why a retry was turned down. Each maps to one HTTP status and one sentence in the app. */
export type RetryRefusalCode =
  "not_found" | "already_ready" | "retry_in_progress" | "retry_rate_limited" | "retry_limit_daily";

/** A retry that may run: the attempt is recorded and the row is pending. */
export type RetryClaimed = {
  status: "claimed";
  recipe: RecipeView;
};

/** A retry that was turned down before anything was fetched. */
export type RetryRefused = {
  status: "refused";
  code: RetryRefusalCode;
};

/** The result of checking the limits and claiming a retry. */
export type RetryClaim = RetryClaimed | RetryRefused;

/** The recipe after it was read again. */
export type RetryDone = {
  status: "done";
  recipe: RecipeView;
};

/** What a retry request ends with. */
export type RetryOutcome = RetryDone | RetryRefused;
