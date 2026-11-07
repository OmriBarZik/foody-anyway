import type { ExtractionLog } from "../extraction/extraction.types";
import type { GeminiPart } from "../library.types";

/** What kind of Gemini call this is. Video calls are priced and logged apart from text calls. */
export type GeminiCallKind = "video" | "text";

/** Fields read from a Gemini reply that explain an empty or blocked answer. */
export type GeminiDiagnostics = {
  finishReason: string | null;
  blockReason: string | null;
  candidateCount: number;
  textLength: number;
};

/** One generateContent call that must come back as JSON. */
export type GenerateJsonRequest = {
  apiKey: string;
  model: string;
  parts: GeminiPart[];
  kind: GeminiCallKind;
  /** Abort the call after this many milliseconds, so it ends before the serverless function is killed. */
  timeoutMs: number;
  log: ExtractionLog;
};
