import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config, assertConfig } from "./config.js";
import { requireAppToken } from "./middleware/auth.js";
import { healthRouter } from "./routes/health.js";
import { imagesRouter } from "./routes/images.js";
import { audioRouter } from "./routes/audio.js";
import { sceneRouter } from "./routes/scene.js";
import { chatRouter } from "./routes/chat.js";
import { warmUpLocalWhisper } from "./localWhisper.js";
import { faceRouter } from "./routes/face.js";

assertConfig();
// no cloud speech key: get the offline Whisper model ready before the first clip
if (!config.openaiKey && !config.groqKey) warmUpLocalWhisper();

const app = express();

// keep the app token (sent as ?token= on image URLs) out of the request log
morgan.token("url", (req) => (req.originalUrl || req.url).replace(/([?&]token=)[^&]*/, "$1***"));
app.use(morgan("tiny"));
app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "10mb" }));

// health is public; everything else needs the app token
app.use(healthRouter);
app.use(requireAppToken);
app.use(imagesRouter);
app.use(audioRouter);
app.use(sceneRouter);
app.use(chatRouter);
app.use(faceRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Server error." });
});

app.listen(config.port, () => {
  console.log(`BloomLearn backend listening on http://localhost:${config.port}`);
  console.log(`  health : GET  /health`);
  console.log(`  image  : POST /images/generations   { prompt, style? }`);
  console.log(`  speech : POST /audio/transcriptions  (multipart: file)`);
  console.log(`  scene  : GET  /scene/:prompt?seed=&width=&height=&raw=  (free image engine)`);
  console.log(`  agent  : POST /chat/completions      { messages }  (Groq, else OpenAI)`);
});
