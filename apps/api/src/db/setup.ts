import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool, withTransaction } from "./pool.js";

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
const migrationVersion = "001_initial";

export async function setupDatabase() {
  const sql = await readFile(schemaPath, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(120) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await pool.query<{ checksum: string }>(
    "SELECT checksum FROM schema_migrations WHERE version = $1",
    [migrationVersion]
  );
  const applied = appliedResult.rows[0];

  if (applied && applied.checksum !== checksum) {
    throw new Error(`Migration ${migrationVersion} was changed after it was applied`);
  }

  if (!applied) {
    await withTransaction(async (client) => {
      await client.exec(sql);
      await client.query("INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)", [
        migrationVersion,
        checksum
      ]);
    });
  }

  console.log(`Database migration ${migrationVersion} is ready`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  setupDatabase()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
