import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA } from "./schema";

/** Open the SQLite file, turn on foreign keys, and create tables if needed. */
export function openDb(databasePath: string): Database {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.run("PRAGMA foreign_keys = ON");

  if (databasePath !== ":memory:") {
    db.run("PRAGMA journal_mode = WAL");
  }

  db.run(SCHEMA);

  return db;
}
