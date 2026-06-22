import { createApp } from "./app.js";
import { pool } from "./db/pool.js";
import { env } from "./shared/env.js";

const server = createApp().listen(env.PORT, () => {
  console.log(`API is running on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal}: shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
