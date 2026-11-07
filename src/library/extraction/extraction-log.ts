import type { ExtractionLog, ExtractionLogEntry, ExtractionLogFields } from "./extraction.types";

/** Longest text kept from an error body or message, so one bad response cannot flood the logs. */
const MAX_TEXT_LENGTH = 2000;

/**
 * A logger that prints one JSON line per event with the recipe id and the time since the job began.
 * Search Vercel runtime logs for `"scope":"extraction"` or the recipe id to follow one save.
 */
export function createExtractionLog({ base }: { base: ExtractionLogFields }): ExtractionLog {
  const startedAt = Date.now();

  function write({ level, entry }: { level: "info" | "warn" | "error"; entry: ExtractionLogEntry }): void {
    const line = JSON.stringify({
      scope: "extraction",
      level,
      event: entry.event,
      elapsedMs: Date.now() - startedAt,
      ...base,
      ...entry.fields,
    });

    if (level === "error") {
      console.error(line);

      return;
    }

    if (level === "warn") {
      console.warn(line);

      return;
    }

    console.info(line);
  }

  return {
    info: (entry) => write({ level: "info", entry }),
    warn: (entry) => write({ level: "warn", entry }),
    error: (entry) => write({ level: "error", entry }),
  };
}

/** A logger that drops every line. Used where a caller does not track a recipe. */
export function silentExtractionLog(): ExtractionLog {
  return {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  };
}

/** Cut long text and remove any copy of a secret before it reaches the logs. */
export function safeLogText({ text, secret }: { text: string; secret: string | null }): string {
  const redacted = secret ? text.split(secret).join("[redacted]") : text;

  if (redacted.length <= MAX_TEXT_LENGTH) {
    return redacted;
  }

  return `${redacted.slice(0, MAX_TEXT_LENGTH)}…`;
}

/** The name and message of a thrown value, safe to log. */
export function describeError({ error, secret }: { error: unknown; secret: string | null }): ExtractionLogFields {
  if (!(error instanceof Error)) {
    return { errorName: "Error", errorMessage: safeLogText({ text: String(error), secret }) };
  }

  return {
    errorName: error.name,
    errorMessage: safeLogText({ text: error.message, secret }),
    errorStack: error.stack ? safeLogText({ text: error.stack, secret }) : null,
  };
}
