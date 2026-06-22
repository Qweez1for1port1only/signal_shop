import cors from "cors";
import express from "express";
import helmet from "helmet";
import { query } from "./db/pool.js";
import { env } from "./shared/env.js";
import { asyncHandler, errorHandler, notFoundHandler } from "./shared/errors.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "32kb" }));

  app.get(
    "/api/health",
    asyncHandler(async (_req, res) => {
      try {
        await query("SELECT 1");
        res.json({ status: "ok", database: "available" });
      } catch {
        res.status(503).json({ status: "degraded", database: "unavailable" });
      }
    })
  );

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
