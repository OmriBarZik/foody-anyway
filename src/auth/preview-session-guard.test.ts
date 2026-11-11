import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { makeSignature } from "better-auth/crypto";
import { expect, test } from "vitest";

import type { AppConfig } from "../config/config.types";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { previewSessionGuard } from "./preview-session-guard";

const SECRET = "preview-guard-test-secret-at-least-32-chars";
const ORIGIN = "https://preview.example.com";

function configFor(deployment: AppConfig["deployment"]): AppConfig {
  return {
    nodeEnv: "production",
    deployment,
    appOrigin: ORIGIN,
    productionOrigin: "https://www.example.com",
    databaseUrl: "postgres://unused",
    sessionSecret: SECRET,
    googleClientId: null,
    googleClientSecret: null,
    geminiApiKey: null,
    geminiModel: "gemini-2.5-flash",
    adminEmails: [],
  };
}

async function setUp(deployment: AppConfig["deployment"]) {
  const db = await openMemoryDb();
  const users: Record<string, unknown>[] = [];
  const store = { user: users, session: [], account: [], verification: [] };
  const auth = betterAuth({
    baseURL: ORIGIN,
    secret: SECRET,
    database: memoryAdapter(store),
    hooks: { before: previewSessionGuard({ config: configFor(deployment), db }) },
  });
  const context = await auth.$context;
  const cookies = { admin: "", cook: "" };

  for (const [id, isAdmin] of [
    ["admin", true],
    ["cook", false],
  ] as const) {
    await db
      .query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", "isAdmin")
       VALUES (?, ?, ?, true, '2026-01-01', '2026-01-01', ?)`,
      )
      .run(id, id, `${id}@example.com`, isAdmin);
    const now = new Date();
    users.push({ id, name: id, email: `${id}@example.com`, emailVerified: true, createdAt: now, updatedAt: now });
    const session = await context.internalAdapter.createSession(id);
    const signature = await makeSignature(session.token, SECRET);
    cookies[id] = `__Secure-better-auth.session_token=${encodeURIComponent(`${session.token}.${signature}`)}`;
  }

  return { auth, cookies };
}

async function sessionUserId({ auth, cookie }: { auth: Awaited<ReturnType<typeof setUp>>["auth"]; cookie: string }) {
  const session = await auth.api.getSession({ headers: new Headers({ cookie }) });

  return session?.user.id ?? null;
}

async function httpSessionUserId({
  auth,
  cookie,
}: {
  auth: Awaited<ReturnType<typeof setUp>>["auth"];
  cookie: string;
}) {
  const response = await auth.handler(new Request(`${ORIGIN}/api/auth/get-session`, { headers: { cookie } }));
  const body = (await response.json()) as { user?: { id: string } } | null;

  return body?.user?.id ?? null;
}

test("on a preview, a non-admin's existing session reads as signed out", async () => {
  const { auth, cookies } = await setUp("preview");

  expect(await sessionUserId({ auth, cookie: cookies.admin })).toBe("admin");
  expect(await sessionUserId({ auth, cookie: cookies.cook })).toBeNull();
  expect(await httpSessionUserId({ auth, cookie: cookies.admin })).toBe("admin");
  expect(await httpSessionUserId({ auth, cookie: cookies.cook })).toBeNull();
});

test("on a preview, a non-admin's session cannot call session-protected auth endpoints", async () => {
  const { auth, cookies } = await setUp("preview");
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth/update-user`, {
      method: "POST",
      headers: { cookie: cookies.cook, "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ name: "renamed" }),
    }),
  );

  expect(response.status).toBe(401);
});

test("in production every session is accepted", async () => {
  const { auth, cookies } = await setUp("production");

  expect(await sessionUserId({ auth, cookie: cookies.cook })).toBe("cook");
});
