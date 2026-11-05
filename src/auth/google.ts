import type { GoogleProfile } from "../domain/domain.types";
import { isRecord } from "../shared/is-record";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

/** The Google sign-in URL for this server's redirect URI. */
export function googleAuthUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

/** Exchange an authorization code for an access token. */
export async function exchangeGoogleCode({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Google sign-in failed. Check the OAuth client secret and the redirect URI.");
  }

  const body = (await response.json()) as unknown;
  const accessToken = isRecord(body) && typeof body.access_token === "string" ? body.access_token : null;

  if (!accessToken) {
    throw new Error("Google did not return an access token. Try signing in again.");
  }

  return accessToken;
}

/** Load the name, email, and photo for the access token. */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Google did not return the account profile. Try signing in again.");
  }

  const body = (await response.json()) as unknown;

  if (
    !isRecord(body) ||
    body.email_verified !== true ||
    typeof body.email !== "string" ||
    typeof body.sub !== "string"
  ) {
    throw new Error("Google did not confirm this email. Try another Google account.");
  }

  const emailName = body.email.split("@")[0] ?? "Foody";
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : emailName;

  return {
    googleId: body.sub,
    email: body.email,
    name,
    pictureUrl: typeof body.picture === "string" && body.picture ? body.picture : null,
  };
}
