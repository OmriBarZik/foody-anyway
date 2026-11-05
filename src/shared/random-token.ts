import { Buffer } from "node:buffer";

/** URL-safe random token for sessions, OAuth state, and invites. */
export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Buffer.from(bytes).toString("base64url");
}
