import { config } from "../config.js";

/**
 * Requires "Authorization: Bearer <APP_TOKEN>" on every request when APP_TOKEN
 * is configured (or "?token=<APP_TOKEN>", for image URLs loaded by <Image>).
 * When it is blank (local dev), auth is skipped.
 */
export function requireAppToken(req, res, next) {
  if (!config.appToken) return next();

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : String(req.query.token || "").trim();

  if (token && token === config.appToken) return next();
  return res.status(401).json({ error: "Unauthorized. Send Authorization: Bearer <app token>." });
}
