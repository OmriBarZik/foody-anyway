import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Better Auth: Google sign-in, the session cookie, and the callback. */
async function handle(request: Request): Promise<Response> {
  const { auth } = await appContext();

  return auth.handler(request);
}

export { handle as GET, handle as POST };
