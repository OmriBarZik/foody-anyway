import type { CrawlResult, DetectedLink } from "./library.types";
import { findRecipeInHtml } from "./parse-jsonld";
import { collectRecipeLinks, emptyPage, fetchText, readOEmbed, readPage } from "./page/read-html";

/** Fetch a saved link and any recipe page it points at. A blocked fetch still returns a result. */
export async function crawlDetectedLink(detected: DetectedLink): Promise<CrawlResult> {
  const started = Date.now();

  try {
    const result =
      detected.platform === "youtube" ? await crawlYoutube(detected) : await crawlHtmlPage(detected.canonicalUrl);

    return { ...result, durationMs: Date.now() - started };
  } catch (error) {
    // The link is still worth saving when the site blocks the fetch.
    console.error(error instanceof Error ? error.name : "Error");

    return emptyResult({ durationMs: Date.now() - started, note: "page_fetch_failed" });
  }
}

async function crawlYoutube(detected: DetectedLink): Promise<Omit<CrawlResult, "durationMs">> {
  const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(detected.canonicalUrl)}`;
  const oembedText = await fetchText(oembedUrl);
  const watchHtml = await fetchText(detected.canonicalUrl);
  const oembed = readOEmbed(oembedText);
  const fromPage = watchHtml ? readPage(watchHtml) : emptyPage();
  const title = oembed.title ?? fromPage.title;
  const thumbnailUrl = oembed.thumbnailUrl ?? fromPage.imageUrl;

  for (const link of collectRecipeLinks(`${oembedText ?? ""}\n${watchHtml ?? ""}`)) {
    const html = await fetchText(link);
    const document = html ? findRecipeInHtml({ html, language: readPage(html).language }) : null;

    if (document) {
      return {
        title: document.recipe.title ?? title,
        thumbnailUrl,
        dishImageUrl: document.imageUrl,
        language: document.recipe.sourceLanguage,
        recipe: document.recipe,
        note: "recipe_page",
      };
    }
  }

  return {
    title,
    thumbnailUrl,
    dishImageUrl: null,
    language: fromPage.language,
    recipe: null,
    note: "no_recipe_on_page",
  };
}

async function crawlHtmlPage(url: string): Promise<Omit<CrawlResult, "durationMs">> {
  const html = await fetchText(url);

  if (!html) {
    return {
      title: null,
      thumbnailUrl: null,
      dishImageUrl: null,
      language: null,
      recipe: null,
      note: "page_fetch_failed",
    };
  }

  const page = readPage(html);
  const document = findRecipeInHtml({ html, language: page.language });

  return {
    title: document?.recipe.title ?? page.title,
    thumbnailUrl: page.imageUrl,
    dishImageUrl: document?.imageUrl ?? null,
    language: page.language,
    recipe: document?.recipe ?? null,
    note: document ? "recipe_page" : "no_recipe_on_page",
  };
}

function emptyResult({ durationMs, note }: { durationMs: number; note: string }): CrawlResult {
  return {
    title: null,
    thumbnailUrl: null,
    dishImageUrl: null,
    language: null,
    recipe: null,
    durationMs,
    note,
  };
}
