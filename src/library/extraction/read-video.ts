import type { Db } from "../../db/db.types";

import { insertCost } from "../../db/costs";
import { extractYoutubeRecipe } from "../extract-video";
import type { ExtractedRecipe } from "../library.types";
import { describeError } from "./extraction-log";
import type { ExtractionLog, GeminiSettings } from "./extraction.types";
import { recordUsage } from "./record-cost";
import type { VideoStepResult } from "./read-video.types";

/** Ask Gemini to watch the video. A failed call is logged and recorded, never thrown. */
export async function readVideo({
  db,
  recipeId,
  gemini,
  apiKey,
  youtubeUrl,
  fallback,
  timeoutMs,
  log,
}: {
  db: Db;
  recipeId: string;
  gemini: GeminiSettings;
  apiKey: string;
  youtubeUrl: string;
  fallback: ExtractedRecipe | null;
  timeoutMs: number;
  log: ExtractionLog;
}): Promise<VideoStepResult> {
  try {
    const video = await extractYoutubeRecipe({ apiKey, model: gemini.model, youtubeUrl, timeoutMs, log });
    await recordUsage({ db, recipeId, origin: "video_understanding", usage: video.usage });

    return { recipe: video.recipe ?? fallback, videoFailed: video.recipe === null };
  } catch (error) {
    // Keep the link even when the model request fails.
    log.error({ event: "video_failed", fields: describeError({ error, secret: apiKey }) });
    await insertCost({
      db,
      cost: {
        recipeId,
        provider: "google",
        model: gemini.model,
        origin: "video_understanding",
        usd: 0,
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        note: "The video request failed before usage was returned.",
      },
    });

    return { recipe: fallback, videoFailed: true };
  }
}
