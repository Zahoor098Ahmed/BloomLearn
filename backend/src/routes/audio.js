import { Router } from "express";
import multer from "multer";
import { config } from "../config.js";
import { transcribeLocally } from "../localWhisper.js";

export const audioRouter = Router();

// keep the uploaded clip in memory — voice words are short (a few seconds)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

/**
 * POST /audio/transcriptions   (multipart/form-data)
 * fields: file (audio), model? (default whisper-1), language?, prompt?
 * → { text }
 */
audioRouter.post("/audio/transcriptions", upload.single("file"), async (req, res) => {
  // OpenAI Whisper when there's an OpenAI key, else Groq's free Whisper
  // (same API shape). The server picks the model, not the app.
  const engine = config.openaiKey
    ? { url: `${config.openaiBase}/audio/transcriptions`, key: config.openaiKey, model: "whisper-1" }
    : config.groqKey
      ? { url: "https://api.groq.com/openai/v1/audio/transcriptions", key: config.groqKey, model: config.groqWhisperModel }
      : null;
  if (!req.file) return res.status(400).json({ error: "An audio file is required (field name: file)." });

  // no key at all: run Whisper offline on this computer, free
  if (!engine) {
    try {
      const raw = await transcribeLocally(req.file.buffer, { filename: req.file.originalname, language: req.body?.language });
      return res.json({ text: raw.replace(/[.。!?]+$/, "") });
    } catch (err) {
      console.error("[audio] local transcription failed:", err.message);
      return res.status(500).json({ error: "Could not turn the recording into text." });
    }
  }

  try {
    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "audio/m4a" });
    form.append("file", blob, req.file.originalname || "speech.m4a");
    form.append("model", engine.model);
    if (req.body?.language) form.append("language", req.body.language);
    form.append(
      "prompt",
      req.body?.prompt || "A single short everyday word for a picture card, e.g. juice, apple, happy.",
    );

    const upstream = await fetch(engine.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${engine.key}` },
      body: form,
    });

    const json = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: json?.error?.message || `Speech engine error ${upstream.status}` });
    }
    const text = String(json.text || "").trim().replace(/[.。!?]+$/, "");
    return res.json({ text });
  } catch (err) {
    console.error("[audio] transcription failed:", err.message);
    return res.status(502).json({ error: "Could not reach the speech service." });
  }
});
