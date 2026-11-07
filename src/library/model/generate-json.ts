import { describeError, safeLogText } from "../extraction/extraction-log";
import type { GeneratedJson, ModelUsage } from "../library.types";
import type { GeminiCallKind, GenerateJsonRequest } from "./model.types";
import { parseModelText, readDiagnostics, readTokenCounts } from "./read-gemini-body";

/** Gemini 2.5 Flash list price for text, image, and video input. Audio input costs more and is not itemized. */
const INPUT_USD_PER_TOKEN = 0.3 / 1_000_000;

/** Gemini 2.5 Flash list price for output, including thinking tokens. */
const OUTPUT_USD_PER_TOKEN = 2.5 / 1_000_000;

/**
 * Call Gemini generateContent and parse its JSON reply. Logs the request, the reply's finish and block reasons,
 * and the error body on a non-2xx status. The API key goes in a header so it never appears in a URL or a log.
 */
export async function generateJson({
  apiKey,
  model,
  parts,
  kind,
  timeoutMs,
  log,
}: GenerateJsonRequest): Promise<GeneratedJson> {
  const started = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let response: Response;

  log.info({ event: "gemini_request", fields: { model, kind, timeoutMs } });

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    log.error({
      event: "gemini_unreachable",
      fields: { model, kind, durationMs: Date.now() - started, ...describeError({ error, secret: apiKey }) },
    });
    throw new Error("Gemini could not be reached or timed out.");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    log.error({
      event: "gemini_http_error",
      fields: {
        model,
        kind,
        status: response.status,
        durationMs: Date.now() - started,
        body: safeLogText({ text: errorBody, secret: apiKey }),
      },
    });
    throw new Error(`Gemini returned ${response.status}.`);
  }

  const body = (await response.json().catch(() => null)) as unknown;
  const payload = parseModelText(body);
  const usage = usageFromBody({ body, model, kind, durationMs: Date.now() - started });
  log.info({
    event: "gemini_response",
    fields: {
      model,
      kind,
      status: response.status,
      durationMs: usage.durationMs,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      jsonParsed: payload !== null,
      ...readDiagnostics(body),
    },
  });

  return { payload, usage };
}

/** Estimate a Gemini 2.5 Flash call from token counts. Round to 6 decimal places. */
export function estimateFlashUsd({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }): number {
  const usd = inputTokens * INPUT_USD_PER_TOKEN + outputTokens * OUTPUT_USD_PER_TOKEN;

  return Math.round(usd * 1_000_000) / 1_000_000;
}

function usageFromBody({
  body,
  model,
  kind,
  durationMs,
}: {
  body: unknown;
  model: string;
  kind: GeminiCallKind;
  durationMs: number;
}): ModelUsage {
  const metadata = body !== null && typeof body === "object" && "usageMetadata" in body ? body.usageMetadata : null;
  const counted = readTokenCounts(metadata);
  const usd = counted ? estimateFlashUsd({ inputTokens: counted.inputTokens, outputTokens: counted.outputTokens }) : 0;

  return {
    model,
    inputTokens: counted?.inputTokens ?? null,
    outputTokens: counted?.outputTokens ?? null,
    usd,
    durationMs,
    note: priceNote({ model, kind }),
  };
}

function priceNote({ model, kind }: { model: string; kind: GeminiCallKind }): string {
  const rates = "USD uses Gemini 2.5 Flash list prices ($0.30 / 1M input, $2.50 / 1M output).";

  if (kind === "video") {
    return `${rates} Audio input is billed higher and is not split out. Public YouTube URLs are currently an unbilled preview, so the invoice may be $0. Model: ${model}.`;
  }

  return `${rates} Model: ${model}.`;
}
