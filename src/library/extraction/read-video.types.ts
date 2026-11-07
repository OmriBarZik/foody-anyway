import type { ExtractedRecipe } from "../library.types";

/** The recipe after the Gemini step, and whether that step failed. */
export type VideoStepResult = {
  recipe: ExtractedRecipe | null;
  videoFailed: boolean;
};

/** Why the Gemini video step did not run. Logged so a skipped video is never silent. */
export type VideoSkipReason = "page_had_recipe" | "not_youtube" | "no_api_key" | "no_time_left";
