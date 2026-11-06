/** Tells the sign-in screen whether Google is configured. Does not open the database. */
export function publicConfig(): Response {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";

  return Response.json({
    google: clientId.length > 0 && clientSecret.length > 0,
  });
}
