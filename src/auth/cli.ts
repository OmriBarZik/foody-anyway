import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { readConfig } from "../config/read-config";
import { createFoodyAuth } from "./create-foody-auth";

const config = readConfig();

if (config.databasePath !== ":memory:") {
  mkdirSync(dirname(config.databasePath), { recursive: true });
}

const db = new Database(config.databasePath);

/** Loaded by `bun x auth@latest migrate --config src/auth/cli.ts`. */
export const auth = createFoodyAuth({ db, config });
