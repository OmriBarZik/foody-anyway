import { isRecord } from "../../shared/is-record";
import type { OEmbedSummary, PageSummary } from "../library.types";

const FETCH_HEADERS = {
  Accept: "text/html,application/json",
  "User-Agent": "Foody/0.1 (household recipe library)",
};

/** GET a page as text. Returns null when the site blocks us or the body is not text. */
export async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType && !contentType.includes("text") && !contentType.includes("json") && !contentType.includes("xml")) {
      return null;
    }

    const text = await response.text();

    return text.slice(0, 1_500_000);
  } catch (error) {
    // One blocked page should not throw away the rest of the save.
    console.error(error instanceof Error ? error.name : "Error");

    return null;
  }
}

/** Title, image, and language from a normal HTML document. */
export function readPage(html: string): PageSummary {
  const title = decodeHtml(readMeta({ html, key: "og:title" }) ?? readTitle(html));
  const imageUrl = decodeHtml(readMeta({ html, key: "og:image" }));

  return { title, imageUrl, language: readLanguage({ html, title }) };
}

/** Empty page summary used when YouTube does not return HTML. */
export function emptyPage(): PageSummary {
  return { title: null, imageUrl: null, language: null };
}

/** Pull the title and thumbnail out of a YouTube oEmbed body. */
export function readOEmbed(text: string | null): OEmbedSummary {
  if (!text) {
    return { title: null, thumbnailUrl: null };
  }

  try {
    const parsed = JSON.parse(text) as unknown;

    if (!isRecord(parsed)) {
      return { title: null, thumbnailUrl: null };
    }

    return {
      title: typeof parsed.title === "string" ? parsed.title : null,
      thumbnailUrl: typeof parsed.thumbnail_url === "string" ? parsed.thumbnail_url : null,
    };
  } catch {
    return { title: null, thumbnailUrl: null };
  }
}

/** Up to two http links that might be a recipe page rather than another video. */
export function collectRecipeLinks(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>\\]+/g) ?? [];
  const unique: string[] = [];

  for (const match of matches) {
    const cleaned = match.replace(/[),.;]+$/, "");

    if (unique.includes(cleaned) || isSkippedHost(cleaned)) {
      continue;
    }

    unique.push(cleaned);

    if (unique.length === 2) {
      break;
    }
  }

  return unique;
}

function isSkippedHost(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");

    return (
      host.endsWith("youtube.com") ||
      host === "youtu.be" ||
      host.endsWith("tiktok.com") ||
      host.endsWith("instagram.com") ||
      host.endsWith("pinterest.com") ||
      host === "pin.it" ||
      host.endsWith("google.com") ||
      host.endsWith("gstatic.com") ||
      host.endsWith("ytimg.com") ||
      host.endsWith("googlevideo.com")
    );
  } catch {
    return true;
  }
}

function readMeta({ html, key }: { html: string; key: string }): string | null {
  const escaped = key.replace(":", "\\:");
  const propertyFirst = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i");
  const contentFirst = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i");

  return propertyFirst.exec(html)?.[1] ?? contentFirst.exec(html)?.[1] ?? null;
}

function readTitle(html: string): string | null {
  return /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim() ?? null;
}

function readLanguage({ html, title }: { html: string; title: string | null }): string | null {
  const lang = /<html[^>]*lang=["']([a-zA-Z-]+)["']/i.exec(html)?.[1]?.toLowerCase() ?? null;

  if (lang?.startsWith("he")) {
    return "he";
  }

  if (lang?.startsWith("en")) {
    return "en";
  }

  return detectLanguage(title);
}

function detectLanguage(text: string | null): string | null {
  if (!text) {
    return null;
  }

  if (/[\u0590-\u05FF]/.test(text)) {
    return "he";
  }

  if (/[A-Za-z]/.test(text)) {
    return "en";
  }

  return null;
}

function decodeHtml(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
