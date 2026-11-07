import { insertCost } from "../../db/costs";
import { updateRecipeContent } from "../../db/recipes";
import { crawlDetectedLink } from "../crawl-page";
import type { ExtractedRecipe } from "../library.types";
import { createExtractionLog, describeError } from "./extraction-log";
import type { ExtractionJob } from "./extraction.types";
import { emptyDraft, finishDraft, isFollowable } from "./finish-draft";
import { readVideo } from "./read-video";
import type { VideoSkipReason } from "./read-video.types";
import { fillTranslations, needsTranslation, stampKnownNames } from "./translate-names";

/** Time this job may use. The recipe routes allow 60 seconds; the rest is left for database writes. */
const JOB_BUDGET_MS = 55_000;

/** Longest single Gemini video call. */
const MAX_VIDEO_MS = 50_000;

/** Below this much time left, a Gemini call would be cut off, so it is skipped and logged. */
const MIN_VIDEO_MS = 10_000;

/** Below this much time left, ingredient translation is skipped. */
const MIN_TRANSLATION_MS = 5_000;

/**
 * Read a saved link into its recipe row: page crawl first, then Gemini for YouTube, then name translation.
 * Every step writes a JSON log line. A crash marks the row failed instead of leaving it pending.
 */
export async function runExtraction(job: ExtractionJob): Promise<void> {
  const { db, gemini, detected, recipeId, householdId, userId, trigger } = job;
  const startedAt = Date.now();
  const timeLeft = () => JOB_BUDGET_MS - (Date.now() - startedAt);
  const log = createExtractionLog({ base: { recipeId, householdId, userId, trigger, platform: detected.platform } });
  const draft = emptyDraft({ recipeId, householdId, userId, detected });

  log.info({
    event: "extraction_started",
    fields: { sourceUrl: detected.canonicalUrl, geminiConfigured: gemini.apiKey !== null, model: gemini.model },
  });

  try {
    const crawl = await crawlDetectedLink(detected);
    log.info({
      event: "crawl_finished",
      fields: {
        note: crawl.note,
        durationMs: crawl.durationMs,
        foundRecipe: crawl.recipe !== null,
        followable: isFollowable(crawl.recipe),
        hasTitle: crawl.title !== null,
        language: crawl.language,
      },
    });
    await insertCost({
      db,
      cost: {
        recipeId,
        provider: "crawler",
        model: null,
        origin: "page_fetch",
        usd: 0,
        inputTokens: null,
        outputTokens: null,
        durationMs: crawl.durationMs,
        note: crawl.note,
      },
    });

    let chosen: ExtractedRecipe | null = crawl.recipe;
    let videoFailed = false;
    const skipReason = videoSkipReason({ job, followable: isFollowable(chosen), timeLeftMs: timeLeft() });

    if (skipReason) {
      log.info({ event: "video_skipped", fields: { reason: skipReason, timeLeftMs: timeLeft() } });
    } else if (gemini.apiKey) {
      const video = await readVideo({
        db,
        recipeId,
        gemini,
        apiKey: gemini.apiKey,
        youtubeUrl: detected.canonicalUrl,
        fallback: chosen,
        timeoutMs: Math.min(MAX_VIDEO_MS, timeLeft()),
        log,
      });
      chosen = video.recipe;
      videoFailed = video.videoFailed;
    }

    if (isFollowable(chosen) && gemini.apiKey && needsTranslation(chosen.ingredients)) {
      if (timeLeft() < MIN_TRANSLATION_MS) {
        log.warn({ event: "translation_skipped", fields: { reason: "no_time_left", timeLeftMs: timeLeft() } });
      } else {
        chosen = {
          ...chosen,
          ingredients: await fillTranslations({
            db,
            recipeId,
            apiKey: gemini.apiKey,
            model: gemini.model,
            ingredients: stampKnownNames({
              ingredients: chosen.ingredients,
              language: chosen.sourceLanguage ?? crawl.language,
            }),
            timeoutMs: timeLeft(),
            log,
          }),
        };
      }
    }

    const finished = finishDraft({ draft, crawl, recipe: chosen, videoFailed });
    await updateRecipeContent({ db, recipe: finished });
    log.info({
      event: "extraction_finished",
      fields: {
        status: finished.extractionStatus,
        note: finished.extractionNote,
        ingredientCount: finished.ingredients.length,
        stepCount: finished.steps.length,
      },
    });
  } catch (error) {
    log.error({ event: "extraction_crashed", fields: describeError({ error, secret: gemini.apiKey }) });
    await updateRecipeContent({
      db,
      recipe: { ...draft, extractionStatus: "failed", extractionNote: "extraction_crashed" },
    });
    throw error;
  }
}

function videoSkipReason({
  job,
  followable,
  timeLeftMs,
}: {
  job: ExtractionJob;
  followable: boolean;
  timeLeftMs: number;
}): VideoSkipReason | null {
  if (followable) {
    return "page_had_recipe";
  }

  if (job.detected.platform !== "youtube") {
    return "not_youtube";
  }

  if (!job.gemini.apiKey) {
    return "no_api_key";
  }

  if (timeLeftMs < MIN_VIDEO_MS) {
    return "no_time_left";
  }

  return null;
}
