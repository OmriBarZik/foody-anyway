import { PANTRY_STAPLES } from "./pantry-catalog";

/** Lowercase, trimmed food name used for comparisons. */
export function normalizeFood(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True when two names are the same food, a simple plural, a translation, or a whole-word phrase. */
export function sameFood(left: string, right: string): boolean {
  const leftNames = namesFor(left);
  const rightNames = namesFor(right);

  return leftNames.some((leftName) => rightNames.some((rightName) => tokensMatch(leftName, rightName)));
}

/** True when any name mentions any listed food. */
export function mentionsFood({ names, words }: { names: string[]; words: string[] }): boolean {
  return words.some((word) => names.some((name) => sameFood(name, word)));
}

function namesFor(value: string): string[] {
  const normalized = normalizeFood(value);
  const staple = PANTRY_STAPLES.find((item) => tokensMatch(item.en, normalized) || tokensMatch(item.he, normalized));

  if (!staple) {
    return normalized ? [normalized] : [];
  }

  return [normalizeFood(staple.en), normalizeFood(staple.he)];
}

function tokensMatch(left: string, right: string): boolean {
  const leftName = normalizeFood(left);
  const rightName = normalizeFood(right);

  if (!leftName || !rightName) {
    return false;
  }

  if (leftName === rightName || root(leftName) === root(rightName)) {
    return true;
  }

  return wordInside(leftName, root(rightName)) || wordInside(rightName, root(leftName));
}

function root(value: string): string {
  if (value.endsWith("oes") && value.length > 4) {
    return value.slice(0, -2);
  }

  if (value.endsWith("ses") && value.length > 4) {
    return value.slice(0, -1);
  }

  if (value.endsWith("s") && !value.endsWith("es") && !value.endsWith("ss") && value.length > 3) {
    return value.slice(0, -1);
  }

  return value;
}

function wordInside(haystack: string, needle: string): boolean {
  if (needle.length < 3 || haystack === needle) {
    return false;
  }

  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(needle)}([^\\p{L}\\p{N}]|$)`, "u");

  return pattern.test(haystack);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
