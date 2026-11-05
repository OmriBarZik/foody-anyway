import { serve } from "bun";

import { createFoodyAuth } from "./auth/create-foody-auth";
import { readConfig } from "./config/read-config";
import { openDb } from "./db/open-db";
import { getInvite, getMe, patchMe, postAcceptInvite, postInvite } from "./http/account-routes";
import { publicConfig } from "./http/auth-routes";
import { getRecipe, getRecipes, postRecipe } from "./http/library-routes";
import { deleteStockItem, getStock, patchStock, postStock } from "./kitchen/stock-routes";
import index from "./index.html";

/**
 * Foody server.
 *
 *   bun --hot src/main.ts
 *
 * Serves the kitchen app and the JSON API. Google sign-in is handled by
 * Better Auth at /api/auth/*. The Google redirect URI is
 * ${APP_ORIGIN}/api/auth/callback/google.
 *
 * Reads APP_ORIGIN, PORT, FOODY_DB, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 * SESSION_SECRET, GEMINI_API_KEY, GEMINI_MODEL, and ADMIN_EMAILS.
 * SESSION_SECRET signs the Better Auth session and is required in production.
 */
function main(): void {
  const config = readConfig();
  const db = openDb(config.databasePath);
  const auth = createFoodyAuth({ db, config });
  const server = serve({
    port: config.port,
    idleTimeout: 120,
    routes: {
      "/*": index,
      "/api/config": {
        GET: () => publicConfig(config),
      },
      "/api/auth": (request) => auth.handler(request),
      "/api/auth/*": (request) => auth.handler(request),
      "/api/me": {
        GET: (request) => getMe({ request, db, auth }),
        PATCH: (request) => patchMe({ request, db, auth }),
      },
      "/api/invites": {
        POST: (request) => postInvite({ request, db, auth, config }),
      },
      "/api/invites/accept": {
        POST: (request) => postAcceptInvite({ request, db, auth }),
      },
      "/api/invites/:token": {
        GET: (request) => getInvite({ request, db }),
      },
      "/api/recipes": {
        GET: (request) => getRecipes({ request, db, auth }),
        POST: (request) => postRecipe({ request, db, auth, config }),
      },
      "/api/recipes/:id": {
        GET: (request) => getRecipe({ request, db, auth }),
      },
      "/api/stock": {
        GET: (request) => getStock({ request, db, auth }),
        POST: (request) => postStock({ request, db, auth }),
      },
      "/api/stock/:id": {
        PATCH: (request) => patchStock({ request, db, auth }),
        DELETE: (request) => deleteStockItem({ request, db, auth }),
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
