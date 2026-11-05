import type { Database } from "bun:sqlite";

import type { AppConfig } from "../config/config.types";

/** Database and startup config shared by the route handlers. */
export type AppServices = {
  db: Database;
  config: AppConfig;
};
