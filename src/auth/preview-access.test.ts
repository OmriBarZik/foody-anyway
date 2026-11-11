import { expect, test } from "vitest";

import type { AppConfig } from "../config/config.types";
import { openMemoryDb } from "../db/testing/open-memory-db";
import { assertPreviewSessionAllowed, assertPreviewSignUpAllowed } from "./preview-access";

function configFor(deployment: AppConfig["deployment"]): AppConfig {
  return {
    nodeEnv: "production",
    deployment,
    appOrigin: "https://preview.example.com",
    productionOrigin: "https://www.example.com",
    databaseUrl: "postgres://unused",
    sessionSecret: "x".repeat(32),
    googleClientId: null,
    googleClientSecret: null,
    geminiApiKey: null,
    geminiModel: "gemini-2.5-flash",
    adminEmails: ["listed@example.com"],
  };
}

test("preview sessions are only for admins", async () => {
  const db = await openMemoryDb();

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
  }

  const preview = configFor("preview");

  await expect(assertPreviewSessionAllowed({ config: preview, db, userId: "admin" })).resolves.toBeUndefined();
  await expect(assertPreviewSessionAllowed({ config: preview, db, userId: "cook" })).rejects.toThrow(/admins only/);
  await expect(
    assertPreviewSessionAllowed({ config: configFor("production"), db, userId: "cook" }),
  ).resolves.toBeUndefined();
});

test("preview sign-up is only for emails in ADMIN_EMAILS", () => {
  const preview = configFor("preview");

  expect(() => assertPreviewSignUpAllowed({ config: preview, email: "Listed@example.com" })).not.toThrow();
  expect(() => assertPreviewSignUpAllowed({ config: preview, email: "new@example.com" })).toThrow(/admins only/);
  expect(() => assertPreviewSignUpAllowed({ config: configFor("local"), email: "new@example.com" })).not.toThrow();
});
