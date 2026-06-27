import type { Request, Response } from "express";
import { createApp } from "../apps/api/src/app.js";
import { initializeDatabase } from "../apps/api/src/db/initialize.js";

const app = createApp();

export default async function handler(req: Request, res: Response) {
  await initializeDatabase();

  const incomingUrl = new URL(req.url, "https://signal-shop.local");
  const path = incomingUrl.searchParams.get("path") ?? "";
  incomingUrl.searchParams.delete("path");
  const query = incomingUrl.searchParams.toString();

  req.url = `/api${path ? `/${path}` : ""}${query ? `?${query}` : ""}`;
  return app(req, res);
}
