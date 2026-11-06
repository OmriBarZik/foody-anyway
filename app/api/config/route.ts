import { publicConfig } from "../../../src/http/auth-routes";

export const dynamic = "force-dynamic";

/** Whether Google sign-in is configured. */
export function GET(): Response {
  return publicConfig();
}
