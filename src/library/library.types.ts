import type { Ingredient, IngredientSystem, RecipeStep, VideoPlatform } from "../domain/domain.types";

/** A link the library knows how to store. */
export type DetectedLink = {
  platform: VideoPlatform;
  canonicalUrl: string;
};

/** A recipe pulled from a page or from the video model. */
export type ExtractedRecipe = {
  isRecipe: boolean;
  title: string | null;
  servings: string | null;
  cookTime: string | null;
  sourceLanguage: string | null;
  sourceMeasurement: IngredientSystem | "mixed" | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
};

/** Recipe JSON-LD plus the finished-dish image, when the page had one. */
export type RecipeDocument = {
  recipe: ExtractedRecipe;
  imageUrl: string | null;
};

/** What a page fetch found before any model call. */
export type CrawlResult = {
  title: string | null;
  thumbnailUrl: string | null;
  dishImageUrl: string | null;
  language: string | null;
  recipe: ExtractedRecipe | null;
  durationMs: number;
  note: string;
};

/** Token counts and the list-price estimate for one model call. */
export type ModelUsage = {
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  usd: number;
  durationMs: number;
  note: string;
};

/** A video-model attempt. recipe is null when the response was not usable. */
export type VideoExtraction = {
  usage: ModelUsage;
  recipe: ExtractedRecipe | null;
};

/** English and Hebrew names for one ingredient, in the same order they were sent. */
export type TranslatedIngredientName = {
  nameEn: string | null;
  nameHe: string | null;
};

/** A text call that only translates ingredient names. */
export type NameTranslation = {
  usage: ModelUsage;
  names: TranslatedIngredientName[];
};

/** A unit we know how to convert. */
export type CanonicalUnit = "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "oz" | "lb" | "floz";

/** How a known unit converts into grams or millilitres. */
export type UnitFact = {
  canonical: CanonicalUnit;
  system: IngredientSystem;
  base: "g" | "ml";
  factor: number;
};

/** Open Graph fields and the page language. */
export type PageSummary = {
  title: string | null;
  imageUrl: string | null;
  language: string | null;
};

/** Title and thumbnail from a YouTube oEmbed response. */
export type OEmbedSummary = {
  title: string | null;
  thumbnailUrl: string | null;
};

/** A text part sent to Gemini. */
export type GeminiTextPart = {
  text: string;
};

/** A public video URL sent to Gemini. */
export type GeminiFileData = {
  fileUri: string;
};

/** A file part sent to Gemini. */
export type GeminiFilePart = {
  fileData: GeminiFileData;
};

/** One part of a Gemini request. */
export type GeminiPart = GeminiTextPart | GeminiFilePart;

/** Token counts read from a Gemini usageMetadata object. */
export type TokenCounts = {
  inputTokens: number;
  outputTokens: number;
};

/** JSON body plus the cost of the call that produced it. */
export type GeneratedJson = {
  payload: unknown;
  usage: ModelUsage;
};

/** A unit word removed from the front of an ingredient line. */
export type SplitUnit = {
  fact: UnitFact;
  name: string;
};
