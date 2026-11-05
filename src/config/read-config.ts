import type { AppConfig } from "./config.types";

/** Read Foody's environment. Throws when production is missing SESSION_SECRET. */
export function readConfig(): AppConfig {
  const port = readPort(process.env.PORT);
  const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
  const sessionSecret =
    process.env.SESSION_SECRET || (nodeEnv === "development" ? "dev-only-session-secret-not-for-production" : "");

  if (!sessionSecret) {
    throw new Error("Set SESSION_SECRET before starting Foody in production.");
  }

  if (nodeEnv === "production" && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Generate one with `openssl rand -base64 32`.");
  }

  const appOrigin = (process.env.APP_ORIGIN || `http://localhost:${port}`).replace(/\/$/, "");

  return {
    port,
    nodeEnv,
    appOrigin,
    databasePath: process.env.FOODY_DB || "data/foody.db",
    sessionSecret,
    secureCookies: nodeEnv === "production",
    googleClientId: blankToNull(process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: blankToNull(process.env.GOOGLE_CLIENT_SECRET),
    geminiApiKey: blankToNull(process.env.GEMINI_API_KEY),
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    adminEmails: readAdminEmails(process.env.ADMIN_EMAILS),
  };
}

function readPort(value: string | undefined): number {
  if (!value) {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a whole number from 1 to 65535.");
  }

  return port;
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function readAdminEmails(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}
