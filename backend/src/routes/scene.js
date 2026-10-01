import { Router } from "express";

export const sceneRouter = Router();

const SCENE_STYLE =
  "flat matte children's book illustration, single clear centred subject, plain white background, " +
  "soft calm colours, bold simple outlines, no text, no watermark, consistent educational style";

const UPSTREAM = process.env.SCENE_UPSTREAM || "https://image.pollinations.ai/prompt";
const POLLINATIONS_TOKEN = process.env.POLLINATIONS_TOKEN || "";

/**
 * GET /scene/:prompt?width=&height=&seed=&model=&raw=1
 *   raw=1 – the app already styled the prompt, so it is sent as is
 * Streams back a generated image. Fronts a free image engine (Pollinations by
 * default) so the app has one stable endpoint and the server can add caching
 * or rate-limiting later without an app update.
 */
sceneRouter.get("/scene/:prompt", async (req, res) => {
  const prompt = String(req.params.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const width = Math.min(1024, Number(req.query.width) || 768);
  const height = Math.min(1024, Number(req.query.height) || 768);
  const seed = Number(req.query.seed) || 0;
  const model = String(req.query.model || "flux");
  // Express has already decoded :prompt — decoding again breaks on a literal "%"
  const full = req.query.raw === "1" ? prompt : `${prompt}. ${SCENE_STYLE}`;
  const auth = POLLINATIONS_TOKEN ? `&token=${encodeURIComponent(POLLINATIONS_TOKEN)}` : "";

  const url =
    `${UPSTREAM}/${encodeURIComponent(full)}` +
    `?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${encodeURIComponent(model)}${auth}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) return res.status(502).json({ error: "Image engine unavailable" });
    res.set("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=604800");
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.send(buf);
  } catch (err) {
    console.error("[scene] failed:", err.message);
    return res.status(502).json({ error: "Could not reach the image engine" });
  }
});
