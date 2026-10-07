import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

/**
 * Free, offline speech-to-text: Whisper running on this computer via
 * transformers.js, used when there is neither an OpenAI nor a Groq key. The
 * model (~80 MB) downloads once on first start and is cached after that.
 * Phones record .m4a, so ffmpeg turns each clip into 16 kHz mono samples first.
 */

const MODEL = process.env.LOCAL_WHISPER_MODEL || "onnx-community/whisper-base";
const LANGUAGES = { en: "english", ar: "arabic", ur: "urdu" };

let asrPromise = null;

function loadAsr() {
  asrPromise ??= import("@huggingface/transformers").then(({ pipeline }) =>
    pipeline("automatic-speech-recognition", MODEL, { dtype: "q8" }),
  );
  return asrPromise;
}

/** Start the download / load in the background so the first clip isn't slow. */
export function warmUpLocalWhisper() {
  const started = Date.now();
  loadAsr()
    .then(() => console.log(`[speech] local Whisper ready (${MODEL}, ${((Date.now() - started) / 1000).toFixed(1)}s)`))
    .catch((err) => {
      asrPromise = null;
      console.error("[speech] local Whisper failed to load:", err.message);
    });
}

/** Any audio file (m4a, webm, wav…) → 16 kHz mono float samples. */
async function decode(buffer, ext) {
  const dir = await mkdtemp(path.join(tmpdir(), "bloomlearn-"));
  const file = path.join(dir, `clip${ext}`);
  try {
    // m4a keeps its index at the end, so ffmpeg needs a real file, not a pipe
    await writeFile(file, buffer);
    return await new Promise((resolve, reject) => {
      const ff = spawn(ffmpegPath, ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1"]);
      const chunks = [];
      let err = "";
      ff.stdout.on("data", (c) => chunks.push(c));
      ff.stderr.on("data", (c) => (err += c));
      ff.on("error", reject);
      ff.on("close", (code) => {
        if (code !== 0) return reject(new Error(err.trim() || `ffmpeg exited with ${code}`));
        const all = Buffer.concat(chunks);
        resolve(new Float32Array(all.buffer, all.byteOffset, Math.floor(all.byteLength / 4)));
      });
    });
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function transcribeLocally(buffer, { filename = "speech.m4a", language } = {}) {
  const audio = await decode(buffer, path.extname(filename) || ".m4a");
  const asr = await loadAsr();
  const lang = LANGUAGES[String(language || "").slice(0, 2).toLowerCase()];
  const out = await asr(audio, lang ? { language: lang, task: "transcribe" } : { task: "transcribe" });
  return String(out?.text ?? "").trim();
}
