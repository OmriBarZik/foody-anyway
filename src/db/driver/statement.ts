import type { DbStatement } from "../db.types";
import type { RunQuery } from "./statement.types";

/** Turn a `?` query into a statement the kitchen code can await. */
export function statement<Row>({ run, text }: { run: RunQuery; text: string }): DbStatement<Row> {
  const sql = bindPlaceholders(text);

  return {
    async get(...params: unknown[]) {
      const result = await run(sql, params);
      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return row as Row;
    },
    async all(...params: unknown[]) {
      const result = await run(sql, params);

      return result.rows as Row[];
    },
    async run(...params: unknown[]) {
      const result = await run(sql, params);

      return { changes: result.rowCount };
    },
  };
}

/** Split the schema script into statements `pg` can run one at a time. */
export function schemaStatements(schema: string): string[] {
  return schema
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function bindPlaceholders(text: string): string {
  let index = 0;

  return text.replace(/\?/g, () => {
    index += 1;

    return `$${index}`;
  });
}
