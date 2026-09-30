import { Router } from "express";
import { config } from "../config.js";

export const imagesRouter = Router();

const SENSORY_STYLE_GUIDE =
  "Flat matte children's book illustration. Single clear centred subject. " +
  "Plain white background, no scene clutter. Soft calm colours, gentle outlines. " +
  "No gloss, no reflections, no 3D shine, no text. Consistent simple style suitable " +
  "for a child with autism.";

/**
 * POST /images/generations
 * body: { prompt, size?, model?, style? }  ("style":"word" tunes the prompt for a single-word card)
 * Mirrors the OpenAI images response shape: { data: [{ b64_json }] }
 */
imagesRouter.post("/images/generations", async (req, res) => {
  if (!config.openaiKey) return res.status(503).json({ error: "Image generation is not configured on the server." });

  const raw = String(req.body?.prompt || "").trim();
  if (!raw) return res.status(400).json({ error: "prompt is required." });

  const prompt =
    req.body?.style === "word"
      ? `A single clear picture of "${raw}" for a communication card. ${SENSORY_STYLE_GUIDE}`
      : `${raw}. ${SENSORY_STYLE_GUIDE}`;

  try {
    const upstream = await fetch(`${config.openaiBase}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.openaiKey}` },
      body: JSON.stringify({
        model: req.body?.model || config.imageModel,
        prompt,
        size: req.body?.size || config.imageSize,
        n: 1,
      }),
    });

    const json = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: json?.error?.message || `OpenAI error ${upstream.status}` });
    }
    return res.json({ data: json.data ?? [] });
  } catch (err) {
    console.error("[images] generation failed:", err.message);
    return res.status(502).json({ error: "Could not reach the image service." });
  }
});

