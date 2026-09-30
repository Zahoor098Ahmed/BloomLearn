import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bloomlearn-backend",
    time: new Date().toISOString(),
    openai: config.openaiKey ? "configured" : "missing",
    auth: config.appToken ? "required" : "open",
  });
});
