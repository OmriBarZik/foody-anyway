import type { AppConfig, Deployment } from "./config.types";

const DEFAULT_PRODUCTION_ORIGIN = "https://www.foodyanyway.com";

/** Read Foody's environment. Throws when production is missing SESSION_SECRET or DATABASE_URL. */
export function readConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
  const sessionSecret =
    process.env.SESSION_SECRET || (nodeEnv === "development" ? "dev-only-session-secret-not-for-production" : "");
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

  if (!sessionSecret) {
    throw new Error("Set SESSION_SECRET before starting Foody in production.");
  }

  if (nodeEnv === "production" && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Generate one with `openssl rand -base64 32`.");
  }

  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL to your Postgres connection string.");
  }

  return {
    nodeEnv,
    deployment: readDeployment(),
    appOrigin: readOrigin(),
    productionOrigin: trimOrigin(process.env.PRODUCTION_ORIGIN) ?? DEFAULT_PRODUCTION_ORIGIN,
    databaseUrl,
    sessionSecret,
    googleClientId: blankToNull(process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: blankToNull(process.env.GOOGLE_CLIENT_SECRET),
    geminiApiKey: blankToNull(process.env.GEMINI_API_KEY),
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    adminEmails: readAdminEmails(process.env.ADMIN_EMAILS),
  };
}

function readDeployment(): Deployment {
  const vercelEnv = process.env.VERCEL_ENV?.trim();

  if (vercelEnv === "production" || vercelEnv === "preview") {
    return vercelEnv;
  }

  return "local";
}

function readOrigin(): string {
  const configured = trimOrigin(process.env.APP_ORIGIN);

  if (configured) {
    return configured;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();

  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}

function trimOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/$/, "");
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
