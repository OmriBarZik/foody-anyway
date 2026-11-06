import { readConfig } from "../config/read-config";
import { openDb } from "../db/open-db";
import { createFoodyAuth } from "./create-foody-auth";

const config = readConfig();
const db = await openDb(config.databaseUrl);

/** Loaded by the Better Auth CLI: `npx auth@latest migrate --config src/auth/cli.ts`. */
export const auth = createFoodyAuth({ db, config });
