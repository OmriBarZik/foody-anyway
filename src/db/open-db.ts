import { Pool, type QueryResult } from "pg";

import type { ConnectedDb, Db } from "./db.types";
import { schemaStatements, statement } from "./driver/statement";
import type { QueryResult as KitchenResult } from "./driver/statement.types";
import { SCHEMA } from "./schema";

/** Open the shared Postgres database and create tables when they are missing. */
export async function openDb(databaseUrl: string): Promise<ConnectedDb> {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    ssl: sslFor(databaseUrl),
  });
  const db = connectPool(pool);
  await applySchema(db);

  return db;
}

function connectPool(pool: Pool): ConnectedDb {
  return {
    pool,
    query(text) {
      return statement({
        run: async (sql, params) => toResult(await pool.query(sql, params)),
        text,
      });
    },
    async transaction(work) {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        const result = await work({
          query(text) {
            return statement({
              run: async (sql, params) => toResult(await client.query(sql, params)),
              text,
            });
          },
          transaction() {
            throw new Error("Kitchen queries already run inside a transaction.");
          },
        });
        await client.query("COMMIT");

        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function applySchema(db: Db): Promise<void> {
  for (const text of schemaStatements(SCHEMA)) {
    await db.query(text).run();
  }
}

function toResult(result: QueryResult): KitchenResult {
  return {
    rows: result.rows,
    rowCount: result.rowCount ?? 0,
  };
}

function sslFor(databaseUrl: string): false | { rejectUnauthorized: boolean } {
  const hostname = new URL(databaseUrl).hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return false;
  }

  return { rejectUnauthorized: false };
}
