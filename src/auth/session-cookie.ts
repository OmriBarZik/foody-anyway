import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

/** Session cookie name. */
export const SESSION_COOKIE = "foody_session";

/** Short-lived cookie that binds an OAuth callback to the browser that started it. */
export const OAUTH_STATE_COOKIE = "foody_oauth_state";

/** Where to send the browser after sign-in, when they were opening an invite. */
export const NEXT_COOKIE = "foody_next";

/** Read one cookie. A malformed value signs nobody in and does not throw. */
export function readCookie({ request, name }: { request: Request; name: string }): string | null {
  const header = request.headers.get("cookie");

  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    const rawName = separator === -1 ? part.trim() : part.slice(0, separator).trim();

    if (rawName !== name) {
      continue;
    }

    const rawValue = separator === -1 ? "" : part.slice(separator + 1).trim();

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return null;
    }
  }

  return null;
}

/** One Set-Cookie header for an HttpOnly cookie. */
export function cookieHeader({
  name,
  value,
  maxAgeSeconds,
  secure,
}: {
  name: string;
  value: string;
  maxAgeSeconds: number;
  secure: boolean;
}): string {
  const secureFlag = secure ? "; Secure" : "";

  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

/** Compare two secrets without leaking which characters matched. */
export function tokensMatch({ left, right }: { left: string; right: string }): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  if (leftBytes.length !== rightBytes.length || leftBytes.length === 0) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}
