import { APIError } from "better-auth/api";

import type { AppConfig } from "../config/config.types";
import type { Db } from "../db/db.types";

// Error code the sign-in redirect carries when a non-admin tries a preview deployment.
const PREVIEW_ADMINS_ONLY = "preview_admins_only";

/** True on Vercel preview deployments, where only admins may sign in. */
function isPreviewOnly({ config }: { config: AppConfig }): boolean {
  return config.deployment === "preview";
}

/** Stops a new account on a preview deployment unless the email is in ADMIN_EMAILS. */
export function assertPreviewSignUpAllowed({ config, email }: { config: AppConfig; email: string }): void {
  if (!isPreviewOnly({ config })) {
    return;
  }

  if (config.adminEmails.includes(email.toLowerCase())) {
    return;
  }

  throw previewForbidden();
}

/** Stops a session on a preview deployment unless the user is an admin. */
export async function assertPreviewSessionAllowed({
  config,
  db,
  userId,
}: {
  config: AppConfig;
  db: Db;
  userId: string;
}): Promise<void> {
  if (await isPreviewSessionAllowed({ config, db, userId })) {
    return;
  }

  throw previewForbidden();
}

/** True off previews, and on a preview when the user is an admin (isAdmin or ADMIN_EMAILS). */
export async function isPreviewSessionAllowed({
  config,
  db,
  userId,
}: {
  config: AppConfig;
  db: Db;
  userId: string;
}): Promise<boolean> {
  if (!isPreviewOnly({ config })) {
    return true;
  }

  const row = await db
    .query<{ isAdmin: boolean; email: string }>(`SELECT "isAdmin", email FROM "user" WHERE id = ?`)
    .get(userId);

  if (!row) {
    return false;
  }

  return row.isAdmin === true || config.adminEmails.includes(row.email.toLowerCase());
}

function previewForbidden(): APIError {
  return new APIError("FORBIDDEN", {
    code: PREVIEW_ADMINS_ONLY,
    message: "Preview deployments are for admins only.",
  });
}
