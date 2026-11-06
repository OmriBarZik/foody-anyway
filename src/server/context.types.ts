import type { FoodyAuth } from "../auth/create-foody-auth";
import type { AppConfig } from "../config/config.types";
import type { ConnectedDb } from "../db/db.types";

/** Database, auth, and config shared by the Next.js route handlers. */
export type AppContext = {
  db: ConnectedDb;
  auth: FoodyAuth;
  config: AppConfig;
};
