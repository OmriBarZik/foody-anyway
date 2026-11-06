import { createFoodyAuth } from "../auth/create-foody-auth";
import { readConfig } from "../config/read-config";
import { openDb } from "../db/open-db";
import type { AppContext } from "./context.types";

let pending: Promise<AppContext> | null = null;

/** One Postgres pool and Better Auth instance for this server process. */
export function appContext(): Promise<AppContext> {
  pending ??= start().catch((error: unknown) => {
    pending = null;
    throw error;
  });

  return pending;
}

async function start(): Promise<AppContext> {
  const config = readConfig();
  const db = await openDb(config.databaseUrl);
  const auth = createFoodyAuth({ db, config });

  return { db, auth, config };
}
