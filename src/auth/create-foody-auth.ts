import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";

import type { AppConfig } from "../config/config.types";
import type { ConnectedDb } from "../db/db.types";
import { createHouseholdForUser, findHouseholdForUser } from "../db/households";
import { assertPreviewSessionAllowed, assertPreviewSignUpAllowed } from "./preview-access";
import { previewSessionGuard } from "./preview-session-guard";

/**
 * Better Auth instance for this process. Google is the only sign-in method.
 * Preview deployments send Google's callback through production (OAuth proxy), and only admins may sign in there.
 */
export function createFoodyAuth({ db, config }: { db: ConnectedDb; config: AppConfig }) {
  const googleReady = Boolean(config.googleClientId && config.googleClientSecret);

  return betterAuth({
    appName: "Foody",
    baseURL: config.appOrigin,
    secret: config.sessionSecret,
    trustedOrigins: trustedOrigins(config.appOrigin),
    database: db.pool,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: googleReady
      ? {
          google: {
            clientId: config.googleClientId ?? "",
            clientSecret: config.googleClientSecret ?? "",
          },
        }
      : undefined,
    user: {
      additionalFields: {
        locale: {
          type: "string",
          required: false,
          defaultValue: "en",
          input: true,
        },
        measurement: {
          type: "string",
          required: false,
          defaultValue: "metric",
          input: true,
        },
        isAdmin: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            assertPreviewSignUpAllowed({ config, email: user.email });

            const row = await db.query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "user"`).get();
            const isFirstAccount = Number(row?.count ?? 0) === 0;
            const isListedAdmin = config.adminEmails.includes(user.email.toLowerCase());

            return {
              data: {
                ...user,
                isAdmin: isFirstAccount || isListedAdmin,
              },
            };
          },
          after: async (user) => {
            const existing = await findHouseholdForUser({ db, userId: user.id });

            if (existing) {
              return;
            }

            const name = user.name.trim() || "Kitchen";
            await createHouseholdForUser({ db, userId: user.id, name });
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            await assertPreviewSessionAllowed({ config, db, userId: session.userId });
          },
        },
      },
    },
    hooks: {
      before: previewSessionGuard({ config, db }),
    },
    plugins: authPlugins(config),
  });
}

// Production needs the proxy too: it runs Google's callback and hands the profile back to the preview.
function authPlugins(config: AppConfig) {
  if (config.deployment === "local") {
    return [nextCookies()];
  }

  return [oAuthProxy({ productionURL: config.productionOrigin }), nextCookies()];
}

// The branch URL is trusted too so the OAuth proxy returns to whichever preview URL the admin opened.
function trustedOrigins(appOrigin: string): string[] {
  const vercelHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .map((host) => host?.trim() ?? "")
    .filter((host) => host.length > 0)
    .map((host) => `https://${host}`);

  return [...new Set([appOrigin, ...vercelHosts])];
}

/** The auth object Foody route handlers call. */
export type FoodyAuth = ReturnType<typeof createFoodyAuth>;
