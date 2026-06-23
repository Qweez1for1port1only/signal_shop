import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { query } from "./db/pool.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { env } from "./shared/env.js";
import { asyncHandler, errorHandler, notFoundHandler } from "./shared/errors.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Слишком много попыток. Повторите позже" }
});

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());

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

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api", productRouter);
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
