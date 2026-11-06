import type { Db } from "../db/db.types";

import type { AppConfig } from "../config/config.types";

/** Database and startup config shared by the route handlers. */
export type AppServices = {
  db: Db;
  config: AppConfig;
};
