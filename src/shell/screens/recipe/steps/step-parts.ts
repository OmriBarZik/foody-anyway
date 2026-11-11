import type { IngredientTerm, StepPart } from "../recipe.types";

const MIN_TAIL = 4;
// Hebrew joins "and", "the", "in", "to", "from", "as" and "that" onto the next word.
const HEBREW_PREFIX = "[\\u05D5\\u05D4\\u05D1\\u05DC\\u05DE\\u05DB\\u05E9]{0,2}(?=\\p{Script=Hebrew})";

/**
 * Split a step into plain text and the words that name an ingredient, so each can show its amount.
 * Matches whole words, ignores case, allows a simple plural, and tries the longest name first.
 */
export function splitStep({ text, terms }: { text: string; terms: IngredientTerm[] }): StepPart[] {
  const owners = new Map<string, number>();

  for (const term of terms) {
    for (const word of wordsFor(term.names)) {
      if (!owners.has(word)) {
        owners.set(word, term.index);
      }
    }
  }

  if (owners.size === 0) {
    return [{ kind: "text", text }];
  }

  const words = [...owners.keys()].sort((left, right) => right.length - left.length);
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?<pre>${HEBREW_PREFIX})?(?<word>${words.map(escape).join("|")})(?:s|es)?(?![\\p{L}\\p{N}])`,
    "giu",
  );
  const parts: StepPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const word = match.groups?.word;
    const index = word === undefined ? undefined : owners.get(word.toLowerCase());

    if (word === undefined || index === undefined || match.index === undefined) {
      continue;
    }

    const start = match.index + (match.groups?.pre?.length ?? 0);
    const end = match.index + match[0].length;
    pushText({ parts, text: text.slice(cursor, start) });
    parts.push({ kind: "ingredient", text: text.slice(start, end), index });
    cursor = end;
  }

  pushText({ parts, text: text.slice(cursor) });

  return parts;
}

function wordsFor(names: string[]): string[] {
  const words = new Set<string>();

  for (const raw of names) {
    const name = raw
      .replace(/\(.*?\)/g, " ")
      .replace(/,.*$/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (name.length < 2) {
      continue;
    }

    words.add(name);
    words.add(singular(name));
    const tail = name.split(" ").at(-1) ?? "";

    if (tail !== name && tail.length >= MIN_TAIL) {
      words.add(tail);
      words.add(singular(tail));
    }
  }

  return [...words].filter((word) => word.length >= 2);
}

function singular(word: string): string {
  if (word.endsWith("oes") && word.length > 4) {
    return word.slice(0, -2);
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}

function pushText({ parts, text }: { parts: StepPart[]; text: string }): void {
  if (text) {
    parts.push({ kind: "text", text });
  }
}

function escape(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
