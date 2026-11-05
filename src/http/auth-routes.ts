import type { AppConfig } from "../config/config.types";

/** Tells the sign-in screen whether Google is configured. */
export function publicConfig(config: AppConfig): Response {
  return Response.json({
    google: Boolean(config.googleClientId && config.googleClientSecret),
  });
}
