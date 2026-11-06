/** Minutes from a cook-time string, or null when the text has no number. */
export function cookMinutes(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const match = /(\d+(?:\.\d+)?)/.exec(value);

  if (!match?.[1]) {
    return null;
  }

  const amount = Number(match[1]);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const lower = value.toLowerCase();

  if (lower.includes("hour") || lower.includes("hr") || value.includes("שעה")) {
    return Math.round(amount * 60);
  }

  return Math.round(amount);
}
