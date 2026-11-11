/** Kitchen tables, plus the Better Auth tables generated for this config. */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" text primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null,
  "locale" text,
  "measurement" text,
  "isAdmin" boolean not null default false
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_idx" ON "account" ("providerId", "accountId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE IF NOT EXISTS households (
  id text primary key,
  name text not null,
  created_at text not null
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id text not null references "user" (id) on delete cascade,
  household_id text not null references households (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at text not null,
  primary key (user_id, household_id)
);

CREATE TABLE IF NOT EXISTS invites (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  token text not null unique,
  created_by_user_id text not null references "user" (id) on delete cascade,
  created_at text not null,
  expires_at text not null
);

CREATE TABLE IF NOT EXISTS recipes (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  saved_by_user_id text not null references "user" (id) on delete cascade,
  source_url text not null,
  platform text not null,
  thumbnail_url text,
  dish_image_url text,
  title text,
  servings text,
  cook_time text,
  ingredients_json text not null,
  steps_json text not null,
  source_language text,
  source_measurement text,
  extraction_status text not null check (extraction_status in ('pending', 'ready', 'needs_review', 'failed')),
  extraction_note text,
  created_at text not null
);

CREATE UNIQUE INDEX IF NOT EXISTS recipes_household_url ON recipes (household_id, source_url);

-- Recipes written by hand have platform 'manual'. The app checks the platform, so older
-- databases drop the video-only check they were created with.
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_platform_check;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_note text;

CREATE TABLE IF NOT EXISTS extraction_costs (
  id text primary key,
  recipe_id text not null references recipes (id) on delete cascade,
  provider text not null,
  model text,
  origin text not null,
  usd double precision not null,
  input_tokens integer,
  output_tokens integer,
  duration_ms integer not null,
  note text,
  created_at text not null
);

CREATE INDEX IF NOT EXISTS extraction_costs_recipe ON extraction_costs (recipe_id);

-- One row per time a link is read, by a save or a retry. Rows are kept when a recipe goes away,
-- so deleting and re-saving a link cannot reset anyone's retry allowance.
CREATE TABLE IF NOT EXISTS extraction_attempts (
  id text primary key,
  recipe_id text not null,
  household_id text not null,
  user_id text not null references "user" (id) on delete cascade,
  trigger text not null check (trigger in ('save', 'retry')),
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS extraction_attempts_recipe ON extraction_attempts (recipe_id, created_at);
CREATE INDEX IF NOT EXISTS extraction_attempts_user ON extraction_attempts (user_id, created_at);
CREATE INDEX IF NOT EXISTS extraction_attempts_household ON extraction_attempts (household_id, created_at);

CREATE TABLE IF NOT EXISTS stock_items (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  location text not null check (location in ('fridge', 'freezer', 'pantry', 'spices')),
  name text not null,
  amount double precision,
  unit text,
  present integer check (present is null or present in (0, 1)),
  updated_at text not null
);

CREATE INDEX IF NOT EXISTS stock_items_household ON stock_items (household_id, location, name);

CREATE TABLE IF NOT EXISTS dietary_profiles (
  user_id text primary key references "user" (id) on delete cascade,
  allergies_json text not null,
  diet text check (diet is null or diet in ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'kosher', 'halal')),
  dislikes_json text not null,
  max_minutes integer,
  budget text check (budget is null or budget in ('low', 'medium', 'high')),
  interests_json text not null,
  updated_at text not null
);

CREATE TABLE IF NOT EXISTS stock_passes (
  household_id text not null references households (id) on delete cascade,
  staple_en text not null,
  decision text not null check (decision in ('have', 'skip')),
  primary key (household_id, staple_en)
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  name text not null,
  amount double precision,
  unit text,
  recipe_id text references recipes (id) on delete set null,
  created_at text not null
);

CREATE INDEX IF NOT EXISTS shopping_items_household ON shopping_items (household_id, created_at);
`;
