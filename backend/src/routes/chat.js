import { Router } from "express";
import { config } from "../config.js";

export const chatRouter = Router();

/**
 * POST /chat/completions
 * body: { messages, temperature?, max_tokens? }
 * Keep-talking mode's scene agent. Uses Groq when GROQ_API_KEY is set (fast,
 * free tier), else OpenAI. The server picks the model so the app never needs to.
 * Mirrors the OpenAI chat response shape: { choices: [{ message: { content } }] }
 */
chatRouter.post("/chat/completions", async (req, res) => {
  const engine = config.groqKey
    ? { url: "https://api.groq.com/openai/v1/chat/completions", key: config.groqKey, model: config.groqModel, groq: true }
    : config.openaiKey
      ? { url: `${config.openaiBase}/chat/completions`, key: config.openaiKey, model: config.chatModel, groq: false }
      : null;
  if (!engine) return res.status(503).json({ error: "The scene agent is not configured on the server." });

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "messages is required." });

  const body = {
    model: engine.model,
    messages: messages.slice(0, 10),
    temperature: Number(req.body?.temperature ?? 0),
    max_tokens: Math.min(1000, Number(req.body?.max_tokens) || 400),
  };
  // gpt-oss on Groq is a reasoning model; gpt-4o-mini rejects this field
  if (engine.groq) body.reasoning_effort = "low";

  try {
    const upstream = await fetch(engine.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${engine.key}` },
      body: JSON.stringify(body),
    });
    const json = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: json?.error?.message || `Chat engine error ${upstream.status}` });
    }
    return res.json({ choices: json.choices ?? [] });
  } catch (err) {
    console.error("[chat] failed:", err.message);
    return res.status(502).json({ error: "Could not reach the chat engine." });
  }
});
