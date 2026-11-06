/** Rows from one Postgres query. */
export type QueryResult = {
  rows: unknown[];
  rowCount: number;
};

/** Runs one SQL string with bound parameters. */
export type RunQuery = (text: string, params: unknown[]) => Promise<QueryResult>;
