import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export type DatabaseClient = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  exec(text: string): Promise<unknown>;
};

type DatabaseAdapter = DatabaseClient & {
  transaction<T>(handler: (client: DatabaseClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
};

async function createPostgresAdapter(connectionString: string): Promise<DatabaseAdapter> {
  const { Pool } = await import("pg");
  const databaseUrl = new URL(connectionString);
  const database = new Pool({
    host: databaseUrl.hostname,
    port: databaseUrl.port ? Number(databaseUrl.port) : 5432,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: decodeURIComponent(databaseUrl.pathname.slice(1)),
    ssl: { rejectUnauthorized: true },
    max: 5,
    idleTimeoutMillis: 10_000
  });

  const wrapQuery = async <T>(text: string, params: unknown[] = []) => {
    const result = await database.query<T & Record<string, unknown>>(text, params);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  };

  return {
    query: wrapQuery,
    exec: (text) => database.query(text),
    async transaction(handler) {
      const client = await database.connect();

      try {
        await client.query("BEGIN");
        const result = await handler({
          async query<T>(text: string, params: unknown[] = []) {
            const queryResult = await client.query<T & Record<string, unknown>>(text, params);
            return { rows: queryResult.rows as T[], rowCount: queryResult.rowCount ?? 0 };
          },
          exec: (text) => client.query(text)
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
    close: () => database.end()
  };
}

async function createLocalAdapter(): Promise<DatabaseAdapter> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataRoot = fileURLToPath(new URL("../../.data", import.meta.url));
  const dataDirectory = fileURLToPath(new URL("../../.data/postgres", import.meta.url));
  mkdirSync(dataRoot, { recursive: true });

  const database = new PGlite(dataDirectory);
  await database.waitReady;

  const wrapQuery = async <T>(text: string, params: unknown[] = []) => {
    const result = await database.query<T>(text, params);
    return {
      rows: result.rows,
      rowCount: result.affectedRows ?? result.rows.length
    };
  };

  return {
    query: wrapQuery,
    exec: (text) => database.exec(text),
    transaction: (handler) =>
      database.transaction((transaction) =>
        handler({
          async query<T>(text: string, params: unknown[] = []) {
            const result = await transaction.query<T>(text, params);
            return {
              rows: result.rows,
              rowCount: result.affectedRows ?? result.rows.length
            };
          },
          exec: (text) => transaction.exec(text)
        })
      ),
    close: () => database.close()
  };
}

let adapterPromise: Promise<DatabaseAdapter> | undefined;

function getAdapter() {
  adapterPromise ??= process.env.DATABASE_URL
    ? createPostgresAdapter(process.env.DATABASE_URL)
    : createLocalAdapter();
  return adapterPromise;
}

async function runQuery<T>(text: string, params: unknown[] = []) {
  const adapter = await getAdapter();
  return adapter.query<T>(text, params);
}

export const pool = {
  query<T>(text: string, params: unknown[] = []) {
    return runQuery<T>(text, params);
  },
  async end() {
    if (!adapterPromise) return;
    const adapter = await adapterPromise;
    await adapter.close();
  }
};

export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  return runQuery<T>(text, params);
}

export async function withTransaction<T>(handler: (client: DatabaseClient) => Promise<T>) {
  const adapter = await getAdapter();
  return adapter.transaction(handler);
}
