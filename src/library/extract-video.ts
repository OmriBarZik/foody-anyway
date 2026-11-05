import { isRecord } from "../shared/is-record";
import type {
  GeminiPart,
  GeneratedJson,
  ModelUsage,
  NameTranslation,
  TokenCounts,
  VideoExtraction,
} from "./library.types";
import { namesFromModelJson, recipeFromModelJson } from "./model/recipe-from-model";

/** Gemini 2.5 Flash list price for text, image, and video input. Audio input costs more and is not itemized. */
const INPUT_USD_PER_TOKEN = 0.3 / 1_000_000;

/** Gemini 2.5 Flash list price for output, including thinking tokens. */
const OUTPUT_USD_PER_TOKEN = 2.5 / 1_000_000;

const VIDEO_PROMPT = `You extract a cooking recipe from this video.
If the video is not someone cooking or explaining a recipe, return {"isRecipe":false}.
Do not invent ingredients, amounts, or steps. Use only what is said or shown.
Steps stay in the video's spoken language.
Each ingredient name is given three ways: the source wording, English, and Hebrew. Translate the name only.
Amounts are numbers. Units are short words such as g, kg, ml, l, tsp, tbsp, cup, oz, lb.
system is "metric", "imperial", or "none".
Return JSON:
{"isRecipe":true,"title":"","servings":null,"cookTime":null,"sourceLanguage":"","sourceMeasurement":"metric","ingredients":[{"name":"","nameEn":"","nameHe":"","amount":null,"unit":null,"system":"none","note":null}],"steps":[""]}`;

/** Estimate a Gemini 2.5 Flash call from token counts. Round to 6 decimal places. */
export function estimateFlashUsd({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }): number {
  const usd = inputTokens * INPUT_USD_PER_TOKEN + outputTokens * OUTPUT_USD_PER_TOKEN;

  return Math.round(usd * 1_000_000) / 1_000_000;
}

/** Ask Gemini to watch a public YouTube URL and return a recipe. Throws when the API itself fails. */
export async function extractYoutubeRecipe({
  apiKey,
  model,
  youtubeUrl,
}: {
  apiKey: string;
  model: string;
  youtubeUrl: string;
}): Promise<VideoExtraction> {
  const generated = await generateJson({
    apiKey,
    model,
    parts: [{ fileData: { fileUri: youtubeUrl } }, { text: VIDEO_PROMPT }],
    kind: "video",
  });

  return { usage: generated.usage, recipe: recipeFromModelJson(generated.payload) };
}

/** Translate ingredient names into English and Hebrew without changing the recipe. */
export async function translateIngredientNames({
  apiKey,
  model,
  names,
}: {
  apiKey: string;
  model: string;
  names: string[];
}): Promise<NameTranslation> {
  const prompt = `Translate these ingredient names into English (nameEn) and Hebrew (nameHe).
Keep the same length and order. Do not add or remove lines. Do not translate amounts.
Return JSON {"names":[{"nameEn":"","nameHe":""}]}.
Names: ${JSON.stringify(names)}`;
  const generated = await generateJson({
    apiKey,
    model,
    parts: [{ text: prompt }],
    kind: "text",
  });

  return { usage: generated.usage, names: namesFromModelJson({ payload: generated.payload, count: names.length }) };
}

async function generateJson({
  apiKey,
  model,
  parts,
  kind,
}: {
  apiKey: string;
  model: string;
  parts: GeminiPart[];
  kind: "video" | "text";
}): Promise<GeneratedJson> {
  const started = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.name : "Error");
    throw new Error("Gemini could not be reached. Check the network and GEMINI_API_KEY.");
  }

  if (!response.ok) {
    throw new Error(`Gemini returned ${response.status}. Check GEMINI_API_KEY and try the video again.`);
  }

  const body = (await response.json()) as unknown;

  return {
    payload: parseModelText(body),
    usage: usageFromBody({ body, model, kind, durationMs: Date.now() - started }),
  };
}

function usageFromBody({
  body,
  model,
  kind,
  durationMs,
}: {
  body: unknown;
  model: string;
  kind: "video" | "text";
  durationMs: number;
}): ModelUsage {
  const metadata = isRecord(body) ? body.usageMetadata : null;
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

function priceNote({ model, kind }: { model: string; kind: "video" | "text" }): string {
  const rates = "USD uses Gemini 2.5 Flash list prices ($0.30 / 1M input, $2.50 / 1M output).";

  if (kind === "video") {
    return `${rates} Audio input is billed higher and is not split out. Public YouTube URLs are currently an unbilled preview, so the invoice may be $0. Model: ${model}.`;
  }

  return `${rates} Model: ${model}.`;
}

function readTokenCounts(value: unknown): TokenCounts | null {
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

function parseModelText(body: unknown): unknown {
  if (!isRecord(body) || !Array.isArray(body.candidates)) {
    return null;
  }

  const candidate = body.candidates[0];

  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    return null;
  }

  return parseJsonObject(
    candidate.content.parts.map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : "")).join(""),
  );
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
