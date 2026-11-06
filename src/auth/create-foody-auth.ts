import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import type { AppConfig } from "../config/config.types";
import type { ConnectedDb } from "../db/db.types";
import { createHouseholdForUser, findHouseholdForUser } from "../db/households";

/** Better Auth instance for this process. Google is the only sign-in method. */
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
    },
    plugins: [nextCookies()],
  });
}

function trustedOrigins(appOrigin: string): string[] {
  const origins = [appOrigin];
  const vercelHost = process.env.VERCEL_URL?.trim();

  if (!vercelHost) {
    return origins;
  }

  const vercelOrigin = `https://${vercelHost}`;

  if (origins.includes(vercelOrigin)) {
    return origins;
  }

  return [...origins, vercelOrigin];
}

/** The auth object Foody route handlers call. */
export type FoodyAuth = ReturnType<typeof createFoodyAuth>;
