import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

import type { AppConfig } from "../config/config.types";
import type { Db } from "../db/db.types";
import { isPreviewSessionAllowed } from "./preview-access";

// The sign-in round trip needs its cookies (OAuth state) even while an older non-admin session is present.
const SIGN_IN_PATHS = ["/sign-in/", "/callback/", "/oauth-proxy-callback", "/sign-out"];

/**
 * Better Auth `hooks.before` that treats a non-admin's session as signed out on preview deployments.
 * It runs for HTTP requests and for `auth.api.*` calls, so `auth.api.getSession` in route handlers is covered too.
 * Without it, a session cookie made on production would be accepted by any preview that shares the database.
 */
export function previewSessionGuard({ config, db }: { config: AppConfig; db: Db }) {
  return createAuthMiddleware(async (ctx) => {
    if (config.deployment !== "preview") {
      return;
    }

    if (SIGN_IN_PATHS.some((prefix) => ctx.path.startsWith(prefix))) {
      return;
    }

    const session = await getSessionFromCtx(ctx);

    if (!session) {
      return;
    }

    if (await isPreviewSessionAllowed({ config, db, userId: session.user.id })) {
      return;
    }

    // getSessionFromCtx caches on the shared context; clear it so the endpoint cannot reuse the non-admin session.
    ctx.context.session = null;

    return { context: { headers: new Headers({ cookie: "" }) } };
  });
}
