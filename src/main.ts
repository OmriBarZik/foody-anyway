import { serve } from "bun";

import { readConfig } from "./config/read-config";
import { openDb } from "./db/open-db";
import { getInvite, getMe, patchMe, postAcceptInvite, postInvite } from "./http/account-routes";
import { beginGoogleSignIn, finishGoogleSignIn, logout, publicConfig } from "./http/auth-routes";
import { getRecipe, getRecipes, postRecipe } from "./http/library-routes";
import index from "./index.html";

/**
 * Foody server.
 *
 *   bun --hot src/main.ts
 *
 * Serves the kitchen app and the JSON API. Reads APP_ORIGIN, PORT, FOODY_DB,
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, GEMINI_API_KEY,
 * GEMINI_MODEL, and ADMIN_EMAILS from the environment. SESSION_SECRET is
 * required when NODE_ENV is production.
 */
function main(): void {
  const config = readConfig();
  const db = openDb(config.databasePath);
  const server = serve({
    port: config.port,
    idleTimeout: 120,
    routes: {
      "/*": index,
      "/api/config": {
        GET: () => publicConfig(config),
      },
      "/api/auth/google": {
        GET: (request) => beginGoogleSignIn({ request, config }),
      },
      "/api/auth/google/callback": {
        GET: (request) => finishGoogleSignIn({ request, db, config }),
      },
      "/api/auth/logout": {
        POST: (request) => logout({ request, db, config }),
      },
      "/api/me": {
        GET: (request) => getMe({ request, db }),
        PATCH: (request) => patchMe({ request, db }),
      },
      "/api/invites": {
        POST: (request) => postInvite({ request, db, config }),
      },
      "/api/invites/accept": {
        POST: (request) => postAcceptInvite({ request, db }),
      },
      "/api/invites/:token": {
        GET: (request) => getInvite({ request, db }),
      },
      "/api/recipes": {
        GET: (request) => getRecipes({ request, db }),
        POST: (request) => postRecipe({ request, db, config }),
      },
      "/api/recipes/:id": {
        GET: (request) => getRecipe({ request, db }),
      },
    },
    development: process.env.NODE_ENV !== "production" && {
      hmr: true,
      console: true,
    },
  });

  console.log(`Foody running at ${server.url}`);
}

if (import.meta.main) {
  main();
}
