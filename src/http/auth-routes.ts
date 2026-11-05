import type { Database } from "bun:sqlite";

import { exchangeGoogleCode, fetchGoogleProfile, googleAuthUrl } from "../auth/google";
import {
  cookieHeader,
  NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  readCookie,
  SESSION_COOKIE,
  tokensMatch,
} from "../auth/session-cookie";
import type { AppConfig } from "../config/config.types";
import { createSession, deleteSession, SESSION_MAX_AGE_SECONDS } from "../db/sessions";
import { upsertGoogleUser } from "../db/users";
import { randomToken } from "../shared/random-token";

const OAUTH_STATE_SECONDS = 10 * 60;

/** Tells the sign-in screen whether Google is configured. */
export function publicConfig(config: AppConfig): Response {
  return Response.json({ google: googleReady(config) });
}

/** Start Google sign-in. */
export function beginGoogleSignIn({ request, config }: { request: Request; config: AppConfig }): Response {
  if (!googleReady(config) || !config.googleClientId) {
    return redirectTo({ location: `${config.appOrigin}/?auth=unconfigured`, cookies: [] });
  }

  const state = randomToken();
  const next = safeNextPath(new URL(request.url).searchParams.get("next"));
  const cookies = [
    cookieHeader({
      name: OAUTH_STATE_COOKIE,
      value: state,
      maxAgeSeconds: OAUTH_STATE_SECONDS,
      secure: config.secureCookies,
    }),
  ];

  if (next) {
    cookies.push(
      cookieHeader({
        name: NEXT_COOKIE,
        value: next,
        maxAgeSeconds: OAUTH_STATE_SECONDS,
        secure: config.secureCookies,
      }),
    );
  }

  return redirectTo({
    location: googleAuthUrl({
      clientId: config.googleClientId,
      redirectUri: redirectUri(config),
      state,
    }),
    cookies,
  });
}

/** Finish Google sign-in and send the browser back to the kitchen or the invite. */
export async function finishGoogleSignIn({
  request,
  db,
  config,
}: {
  request: Request;
  db: Database;
  config: AppConfig;
}): Promise<Response> {
  const cleared = [
    cookieHeader({ name: OAUTH_STATE_COOKIE, value: "", maxAgeSeconds: 0, secure: config.secureCookies }),
    cookieHeader({ name: NEXT_COOKIE, value: "", maxAgeSeconds: 0, secure: config.secureCookies }),
  ];
  const failed = redirectTo({ location: `${config.appOrigin}/?auth=failed`, cookies: cleared });

  if (!googleReady(config) || !config.googleClientId || !config.googleClientSecret) {
    return redirectTo({ location: `${config.appOrigin}/?auth=unconfigured`, cookies: cleared });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readCookie({ request, name: OAUTH_STATE_COOKIE });

  if (!code || !state || !expected || !tokensMatch({ left: state, right: expected })) {
    return failed;
  }

  try {
    const accessToken = await exchangeGoogleCode({
      code,
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      redirectUri: redirectUri(config),
    });
    const profile = await fetchGoogleProfile(accessToken);
    const saved = upsertGoogleUser({ db, profile, adminEmails: config.adminEmails });
    const sessionId = createSession({ db, userId: saved.user.id });
    const next = safeNextPath(readCookie({ request, name: NEXT_COOKIE })) ?? "/";

    return redirectTo({
      location: `${config.appOrigin}${next}`,
      cookies: [
        ...cleared,
        cookieHeader({
          name: SESSION_COOKIE,
          value: sessionId,
          maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
          secure: config.secureCookies,
        }),
      ],
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Error");

    return failed;
  }
}

/** End the session cookie. */
export function logout({ request, db, config }: { request: Request; db: Database; config: AppConfig }): Response {
  const sessionId = readCookie({ request, name: SESSION_COOKIE });

  if (sessionId) {
    deleteSession({ db, sessionId });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": cookieHeader({ name: SESSION_COOKIE, value: "", maxAgeSeconds: 0, secure: config.secureCookies }),
    },
  });
}

function googleReady(config: AppConfig): boolean {
  return Boolean(config.googleClientId && config.googleClientSecret);
}

function redirectUri(config: AppConfig): string {
  return `${config.appOrigin}/api/auth/google/callback`;
}

function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/invite/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  return value;
}

function redirectTo({ location, cookies }: { location: string; cookies: string[] }): Response {
  const headers = new Headers();
  headers.set("Location", location);

  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, { status: 302, headers });
}
