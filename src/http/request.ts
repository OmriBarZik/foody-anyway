/** Parse a JSON body. Returns null when the body is empty or not JSON. */
export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** Path segment by position. `/api/recipes/:id` keeps the id at index 3. */
export function pathParam({ request, index }: { request: Request; index: number }): string | null {
  const part = new URL(request.url).pathname.split("/")[index] ?? "";

  if (!part) {
    return null;
  }

  try {
    return decodeURIComponent(part);
  } catch {
    return null;
  }
}
