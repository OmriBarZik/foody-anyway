import type {
  AcceptInviteResult,
  InviteLink,
  InvitePreview,
  Locale,
  MeasurementSystem,
  PublicConfig,
  RecipeView,
  UserView,
} from "../domain/domain.types";
import { isRecord } from "../shared/is-record";

/** API error code the screens map to a sentence. */
export class ApiError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

/** Whether Google sign-in is configured. */
export async function fetchConfig(): Promise<PublicConfig> {
  const response = await fetch("/api/config");

  if (!response.ok) {
    throw new ApiError("load_failed");
  }

  const body = (await response.json()) as unknown;

  if (!isRecord(body) || typeof body.google !== "boolean") {
    throw new ApiError("load_failed");
  }

  return { google: body.google };
}

/** The signed-in account, or null when the cookie is missing. */
export async function fetchMe(): Promise<UserView | null> {
  const response = await fetch("/api/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new ApiError("load_failed");
  }

  return (await response.json()) as UserView;
}

/** Save language or measurement and return the updated account. */
export async function updateMe({
  locale,
  measurement,
}: {
  locale?: Locale;
  measurement?: MeasurementSystem;
}): Promise<UserView> {
  return readOk(
    await fetch("/api/me", { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ locale, measurement }) }),
  );
}

/** Videos in this kitchen, newest first. */
export async function fetchRecipes(): Promise<RecipeView[]> {
  return readOk(await fetch("/api/recipes"));
}

/** One video in this kitchen. */
export async function fetchRecipe(recipeId: string): Promise<RecipeView> {
  return readOk(await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`));
}

/** Save a video link. The request waits until reading finishes. */
export async function saveRecipe(url: string): Promise<RecipeView> {
  return readOk(await fetch("/api/recipes", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ url }) }));
}

/** Ask for an invite link. */
export async function createInvite(): Promise<InviteLink> {
  return readOk(await fetch("/api/invites", { method: "POST" }));
}

/** Kitchen name on an invite link. */
export async function fetchInvite(token: string): Promise<InvitePreview> {
  return readOk(await fetch(`/api/invites/${encodeURIComponent(token)}`));
}

/** Join the kitchen on an invite link. */
export async function acceptInvite(token: string): Promise<AcceptInviteResult> {
  return readOk(
    await fetch("/api/invites/accept", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ token }) }),
  );
}

/** End the session. */
export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw new ApiError("load_failed");
  }
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

async function readOk<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const code = isRecord(body) && typeof body.error === "string" ? body.error : "save_failed";
    throw new ApiError(code);
  }

  return body as T;
}
