/** A JSON error the client maps to a sentence. */
export function jsonError({ status, code }: { status: number; code: string }): Response {
  return Response.json({ error: code }, { status });
}
