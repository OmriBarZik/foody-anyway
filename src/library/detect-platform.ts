import type { VideoPlatform } from "../domain/domain.types";
import type { DetectedLink } from "./library.types";

/** Turn a pasted link into a platform and a stable URL, or null when it is not a cooking video. */
export function detectPlatform(rawUrl: string): DetectedLink | null {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (isYoutubeHost(host)) {
    return youtubeLink(url, host);
  }

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    return socialLink({ url, platform: "tiktok" });
  }

  if (host === "instagram.com" || host.endsWith(".instagram.com") || host === "instagr.am") {
    return socialLink({ url, platform: "instagram" });
  }

  if (host === "pin.it" || host === "pinterest.com" || host.endsWith(".pinterest.com")) {
    return socialLink({ url, platform: "pinterest" });
  }

  return null;
}

function isYoutubeHost(host: string): boolean {
  return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
}

function youtubeLink(url: URL, host: string): DetectedLink | null {
  const shortsId = /^\/shorts\/([\w-]{6,20})/.exec(url.pathname)?.[1];

  if (shortsId) {
    return { platform: "youtube", canonicalUrl: `https://www.youtube.com/shorts/${shortsId}` };
  }

  const videoId = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.searchParams.get("v");

  if (!videoId || !/^[\w-]{6,20}$/.test(videoId)) {
    return null;
  }

  return { platform: "youtube", canonicalUrl: `https://www.youtube.com/watch?v=${videoId}` };
}

function socialLink({ url, platform }: { url: URL; platform: VideoPlatform }): DetectedLink | null {
  const path = url.pathname.replace(/\/+$/, "");

  if (!path) {
    return null;
  }

  const host =
    platform === "pinterest" && url.hostname.replace(/^www\./, "") === "pin.it" ? "pin.it" : canonicalHost(platform);

  return { platform, canonicalUrl: `https://${host}${path}` };
}

function canonicalHost(platform: VideoPlatform): string {
  if (platform === "tiktok") {
    return "www.tiktok.com";
  }

  if (platform === "instagram") {
    return "www.instagram.com";
  }

  if (platform === "pinterest") {
    return "www.pinterest.com";
  }

  return "www.youtube.com";
}
