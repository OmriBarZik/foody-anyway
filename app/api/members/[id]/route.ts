import { deleteMember } from "../../../../src/household/household-routes";
import { appContext } from "../../../../src/server/context";

export const dynamic = "force-dynamic";

/** Remove one person from the kitchen, or let the signed-in person leave it. */
export async function DELETE(request: Request): Promise<Response> {
  const { auth, db } = await appContext();

  return deleteMember({ request, db, auth });
}
