import { PGlite, type Transaction } from "@electric-sql/pglite";

import type { Db } from "../db.types";
import { schemaStatements, statement } from "../driver/statement";
import type { QueryResult } from "../driver/statement.types";
import { SCHEMA } from "../schema";

/** A throwaway Postgres for tests. Nothing here is shared with the hosted database. */
export async function openMemoryDb(): Promise<Db> {
  const client = new PGlite();
  const db = memoryDb(client);
  await applySchema(db);

  return db;
}

function memoryDb(client: PGlite | Transaction): Db {
  return {
    query(text) {
      return statement({
        run: (sql, params) => runMemory({ client, sql, params }),
        text,
      });
    },
    async transaction(work) {
      if (!("transaction" in client)) {
        throw new Error("Kitchen queries already run inside a transaction.");
      }

      return client.transaction(async (tx) => work(memoryDb(tx)));
    },
  };
}

async function applySchema(db: Db): Promise<void> {
  for (const text of schemaStatements(SCHEMA)) {
    await db.query(text).run();
  }
}

async function runMemory({
  client,
  sql,
  params,
}: {
  client: PGlite | Transaction;
  sql: string;
  params: unknown[];
}): Promise<QueryResult> {
  const result = await client.query(sql, params);

  return {
    rows: result.rows,
    rowCount: result.rowCount ?? result.affectedRows ?? 0,
  };
}
