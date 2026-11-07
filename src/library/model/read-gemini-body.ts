import { isRecord } from "../../shared/is-record";
import type { TokenCounts } from "../library.types";
import type { GeminiDiagnostics } from "./model.types";

/** The JSON object the model wrote, or null when the reply has no usable JSON. */
export function parseModelText(body: unknown): unknown {
  const text = candidateText(body);

  if (text === null) {
    return null;
  }

  return parseJsonObject(text);
}

/** Why Gemini stopped or blocked, read from the reply, for the logs. */
export function readDiagnostics(body: unknown): GeminiDiagnostics {
  const candidate = firstCandidate(body);
  const feedback = isRecord(body) && isRecord(body.promptFeedback) ? body.promptFeedback : null;
  const text = candidateText(body);

  return {
    finishReason: candidate && typeof candidate.finishReason === "string" ? candidate.finishReason : null,
    blockReason: feedback && typeof feedback.blockReason === "string" ? feedback.blockReason : null,
    candidateCount: isRecord(body) && Array.isArray(body.candidates) ? body.candidates.length : 0,
    textLength: text?.length ?? 0,
  };
}

/** Input and output token counts from usageMetadata, counting thinking tokens as output. */
export function readTokenCounts(value: unknown): TokenCounts | null {
  if (!isRecord(value)) {
    return null;
  }

  const inputTokens = readCount(value.promptTokenCount);
  const outputTokens = (readCount(value.candidatesTokenCount) ?? 0) + (readCount(value.thoughtsTokenCount) ?? 0);

  if (inputTokens === null && outputTokens === 0) {
    return null;
  }

  return { inputTokens: inputTokens ?? 0, outputTokens };
}

function firstCandidate(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body) || !Array.isArray(body.candidates)) {
    return null;
  }

  const candidate: unknown = body.candidates[0];

  return isRecord(candidate) ? candidate : null;
}

function candidateText(body: unknown): string | null {
  const candidate = firstCandidate(body);

  if (!candidate || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    return null;
  }

  return candidate.content.parts
    .map((part: unknown) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("");
}

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(text.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function readCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}
