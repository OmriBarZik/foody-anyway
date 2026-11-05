import { betterAuth } from "better-auth";
import type { Database } from "bun:sqlite";

import type { AppConfig } from "../config/config.types";
import { createHouseholdForUser, findHouseholdForUser } from "../db/households";

/** Better Auth instance for this process. Google is the only sign-in method. */
export function createFoodyAuth({ db, config }: { db: Database; config: AppConfig }) {
  const googleReady = Boolean(config.googleClientId && config.googleClientSecret);

  return betterAuth({
    appName: "Foody",
    baseURL: config.appOrigin,
    secret: config.sessionSecret,
    trustedOrigins: [config.appOrigin],
    database: db,
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
            const row = db.query<{ count: number }, []>(`SELECT COUNT(*) AS count FROM "user"`).get();
            const isFirstAccount = (row?.count ?? 0) === 0;
            const isListedAdmin = config.adminEmails.includes(user.email.toLowerCase());

            return {
              data: {
                ...user,
                isAdmin: isFirstAccount || isListedAdmin,
              },
            };
          },
          after: async (user) => {
            const existing = findHouseholdForUser({ db, userId: user.id });

            if (existing) {
              return;
            }

            const name = user.name.trim() || "Kitchen";
            createHouseholdForUser({ db, userId: user.id, name });
          },
        },
      },
    },
  });
}

/** The auth object the rest of the server calls. */
export type FoodyAuth = ReturnType<typeof createFoodyAuth>;
