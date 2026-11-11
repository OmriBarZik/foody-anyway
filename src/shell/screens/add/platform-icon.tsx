import type { RecipePlatform } from "../../../domain/domain.types";

/** A small mark for where a recipe came from. Simple glyphs, not the platforms' own logos. */
export function PlatformIcon({ platform, size = 18 }: { platform: RecipePlatform; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph(platform)}
    </svg>
  );
}

function glyph(platform: RecipePlatform) {
  if (platform === "youtube") {
    return (
      <>
        <rect x="3" y="6" width="18" height="12" rx="4" />
        <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" />
      </>
    );
  }

  if (platform === "tiktok") {
    return (
      <>
        <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 4c.5 2.5 2.5 4 5 4" />
      </>
    );
  }

  if (platform === "instagram") {
    return (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M16.5 7.5h.01" />
      </>
    );
  }

  if (platform === "pinterest") {
    return (
      <>
        <circle cx="12" cy="10" r="6" />
        <path d="M11 13l-2 8" />
      </>
    );
  }

  return (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  );
}
