import type { ExtractionTrigger } from "../../db/attempts/attempts.types";
import type { Db } from "../../db/db.types";
import type { DetectedLink } from "../library.types";

/** Values allowed in one structured log line. Never put secrets here. */
export type ExtractionLogValue = string | number | boolean | null;

/** Extra fields on one structured log line. */
export type ExtractionLogFields = Record<string, ExtractionLogValue>;

/** One structured log line about reading a video. */
export type ExtractionLogEntry = {
  event: string;
  fields?: ExtractionLogFields;
};

/** Writes JSON log lines tagged with one recipe, so Vercel logs can be filtered by recipeId. */
export type ExtractionLog = {
  info: (entry: ExtractionLogEntry) => void;
  warn: (entry: ExtractionLogEntry) => void;
  error: (entry: ExtractionLogEntry) => void;
};

/** Gemini settings, or a null key when video reading is off. */
export type GeminiSettings = {
  apiKey: string | null;
  model: string;
};

/** Everything needed to read one saved link into its recipe row. */
export type ExtractionJob = {
  db: Db;
  gemini: GeminiSettings;
  detected: DetectedLink;
  recipeId: string;
  householdId: string;
  userId: string;
  trigger: ExtractionTrigger;
};
