/** Kitchen tables, plus the Better Auth tables generated for this config. */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" integer not null,
  "image" text,
  "createdAt" date not null,
  "updatedAt" date not null,
  "locale" text,
  "measurement" text,
  "isAdmin" integer
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text not null primary key,
  "expiresAt" date not null,
  "token" text not null unique,
  "createdAt" date not null,
  "updatedAt" date not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" date,
  "refreshTokenExpiresAt" date,
  "scope" text,
  "password" text,
  "createdAt" date not null,
  "updatedAt" date not null
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" date not null,
  "createdAt" date not null,
  "updatedAt" date not null
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  household_id TEXT NOT NULL REFERENCES households (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, household_id)
);

CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by_user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households (id) ON DELETE CASCADE,
  saved_by_user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'pinterest')),
  thumbnail_url TEXT,
  dish_image_url TEXT,
  title TEXT,
  servings TEXT,
  cook_time TEXT,
  ingredients_json TEXT NOT NULL,
  steps_json TEXT NOT NULL,
  source_language TEXT,
  source_measurement TEXT,
  extraction_status TEXT NOT NULL CHECK (extraction_status IN ('pending', 'ready', 'needs_review', 'failed')),
  extraction_note TEXT,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS recipes_household_url ON recipes (household_id, source_url);

CREATE TABLE IF NOT EXISTS extraction_costs (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  origin TEXT NOT NULL,
  usd REAL NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  duration_ms INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS extraction_costs_recipe ON extraction_costs (recipe_id);
`;
