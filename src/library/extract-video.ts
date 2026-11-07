import type { ExtractionLog } from "./extraction/extraction.types";
import type { NameTranslation, VideoExtraction } from "./library.types";
import { generateJson } from "./model/generate-json";
import { namesFromModelJson, recipeFromModelJson } from "./model/recipe-from-model";

const VIDEO_PROMPT = `You extract a cooking recipe from this video.
If the video is not someone cooking or explaining a recipe, return {"isRecipe":false}.
Do not invent ingredients, amounts, or steps. Use only what is said or shown.
Steps stay in the video's spoken language.
Each ingredient name is given three ways: the source wording, English, and Hebrew. Translate the name only.
Amounts are numbers. Units are short words such as g, kg, ml, l, tsp, tbsp, cup, oz, lb.
system is "metric", "imperial", or "none".
Return JSON:
{"isRecipe":true,"title":"","servings":null,"cookTime":null,"sourceLanguage":"","sourceMeasurement":"metric","ingredients":[{"name":"","nameEn":"","nameHe":"","amount":null,"unit":null,"system":"none","note":null}],"steps":[""]}`;

/** Ask Gemini to watch a public YouTube URL and return a recipe. Throws when the API itself fails. */
export async function extractYoutubeRecipe({
  apiKey,
  model,
  youtubeUrl,
  timeoutMs,
  log,
}: {
  apiKey: string;
  model: string;
  youtubeUrl: string;
  timeoutMs: number;
  log: ExtractionLog;
}): Promise<VideoExtraction> {
  const generated = await generateJson({
    apiKey,
    model,
    parts: [{ fileData: { fileUri: youtubeUrl } }, { text: VIDEO_PROMPT }],
    kind: "video",
    timeoutMs,
    log,
  });
  const recipe = recipeFromModelJson(generated.payload);
  log.info({
    event: "video_recipe_parsed",
    fields: {
      shapeValid: recipe !== null,
      isRecipe: recipe?.isRecipe ?? null,
      ingredientCount: recipe?.ingredients.length ?? 0,
      stepCount: recipe?.steps.length ?? 0,
    },
  });

  return { usage: generated.usage, recipe };
}

/** Translate ingredient names into English and Hebrew without changing the recipe. */
export async function translateIngredientNames({
  apiKey,
  model,
  names,
  timeoutMs,
  log,
}: {
  apiKey: string;
  model: string;
  names: string[];
  timeoutMs: number;
  log: ExtractionLog;
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
    timeoutMs,
    log,
  });

  return { usage: generated.usage, names: namesFromModelJson({ payload: generated.payload, count: names.length }) };
}
