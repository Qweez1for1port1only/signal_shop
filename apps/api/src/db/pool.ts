import { PGlite, type Transaction } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dataRoot = fileURLToPath(new URL("../../.data", import.meta.url));
const dataDirectory = fileURLToPath(new URL("../../.data/postgres", import.meta.url));
mkdirSync(dataRoot, { recursive: true });

const database = new PGlite(dataDirectory);

export type DatabaseClient = Pick<Transaction, "query" | "exec">;

async function runQuery<T>(text: string, params: unknown[] = []) {
  const result = await database.query<T>(text, params);
  return {
    ...result,
    rowCount: result.affectedRows ?? result.rows.length
  };
}

export const pool = {
  query<T>(text: string, params: unknown[] = []) {
    return runQuery<T>(text, params);
  },
  end() {
    return database.close();
  }
};

export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  return runQuery<T>(text, params);
}

export function withTransaction<T>(handler: (client: DatabaseClient) => Promise<T>) {
  return database.transaction(handler);
}
