import { expect, test } from "vitest";

import { openMemoryDb } from "../db/testing/open-memory-db";
import { listMembers } from "./list-members";

test("members list the owner first and only people in that kitchen", async () => {
  const db = await openMemoryDb();

  for (const [id, name] of [
    ["ada", "Ada"],
    ["ben", "Ben"],
    ["cy", "Cy"],
  ]) {
    await db
      .query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", "isAdmin")
       VALUES (?, ?, ?, true, '2026-01-01', '2026-01-01', false)`,
      )
      .run(id, name, `${id}@example.com`);
  }

  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Home', '2026-01-01')").run();
  await db.query("INSERT INTO households (id, name, created_at) VALUES ('away', 'Away', '2026-01-01')").run();
  await db
    .query(
      `INSERT INTO memberships (user_id, household_id, role, created_at) VALUES
       ('ben', 'home', 'member', '2026-01-03'), ('ada', 'home', 'owner', '2026-01-02'), ('cy', 'away', 'owner', '2026-01-01')`,
    )
    .run();

  const members = await listMembers({ db, householdId: "home" });

  expect(members.map((member) => [member.name, member.role])).toEqual([
    ["Ada", "owner"],
    ["Ben", "member"],
  ]);
});
