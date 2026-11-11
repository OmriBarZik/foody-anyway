import { expect, test } from "vitest";

import { openMemoryDb } from "../db/testing/open-memory-db";
import { listMembers } from "./list-members";
import { removeMember } from "./remove-member";
import { renameHousehold } from "./rename-household";

async function seedKitchen() {
  const db = await openMemoryDb();

  for (const id of ["ada", "ben", "cy"]) {
    await db
      .query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", "isAdmin")
         VALUES (?, ?, ?, true, '2026-01-01', '2026-01-01', false)`,
      )
      .run(id, id, `${id}@example.com`);
  }

  await db.query("INSERT INTO households (id, name, created_at) VALUES ('home', 'Home', '2026-01-01')").run();
  await db
    .query(
      `INSERT INTO memberships (user_id, household_id, role, created_at) VALUES
       ('ada', 'home', 'owner', '2026-01-01'), ('ben', 'home', 'member', '2026-01-02'), ('cy', 'home', 'member', '2026-01-03')`,
    )
    .run();

  return db;
}

test("only the owner renames the kitchen", async () => {
  const db = await seedKitchen();

  expect(await renameHousehold({ db, householdId: "home", userId: "ben", name: "Nope" })).toBe(false);
  expect(await renameHousehold({ db, householdId: "home", userId: "ada", name: "Ada's place" })).toBe(true);

  const row = await db.query<{ name: string }>("SELECT name FROM households WHERE id = 'home'").get();

  expect(row?.name).toBe("Ada's place");
});

test("the owner removes a member but a member cannot remove anyone else", async () => {
  const db = await seedKitchen();

  expect(await removeMember({ db, householdId: "home", actorUserId: "ben", targetUserId: "cy" })).toBe("forbidden");
  expect(await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "cy" })).toBe("removed");
  expect(await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "cy" })).toBe("missing");

  const members = await listMembers({ db, householdId: "home" });

  expect(members.map((member) => member.id)).toEqual(["ada", "ben"]);
});

test("a member can leave, and the owner leaving hands the kitchen to the next member", async () => {
  const db = await seedKitchen();

  expect(await removeMember({ db, householdId: "home", actorUserId: "cy", targetUserId: "cy" })).toBe("left");
  expect(await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "ada" })).toBe("left");

  const members = await listMembers({ db, householdId: "home" });

  expect(members.map((member) => [member.id, member.role])).toEqual([["ben", "owner"]]);
});

test("the last person leaving deletes the kitchen", async () => {
  const db = await seedKitchen();
  await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "cy" });
  await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "ben" });

  expect(await removeMember({ db, householdId: "home", actorUserId: "ada", targetUserId: "ada" })).toBe("left");

  const row = await db.query("SELECT id FROM households WHERE id = 'home'").get();

  expect(row).toBeNull();
});
