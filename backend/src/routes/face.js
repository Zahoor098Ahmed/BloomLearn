import { Router } from "express";
import { config } from "../config.js";

export const faceRouter = Router();

/**
 * Compares two vector embeddings using cosine similarity.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * POST /face/recognize
 * body: {
 *   probeEmbedding?: number[],
 *   probeImageBase64?: string,
 *   profiles: Array<{ id: string, name: string, embeddings: number[][], photoBase64?: string }>
 * }
 * Returns best matching profile with confidence score.
 */
faceRouter.post("/face/recognize", async (req, res) => {
  const { probeEmbedding, probeImageBase64, profiles } = req.body || {};

  if (!Array.isArray(profiles) || profiles.length === 0) {
    return res.status(400).json({ error: "Profiles array is required." });
  }

  // 1. If probe embedding is provided, run high-precision multi-sample cosine matching
  if (Array.isArray(probeEmbedding) && probeEmbedding.length > 0) {
    let bestMatch = null;
    let highestScore = -1;
    let runnerUpScore = -1;

    for (const prof of profiles) {
      const sampleEmbeddings = Array.isArray(prof.embeddings) ? prof.embeddings : [];
      let maxChildScore = 0;

      for (const sample of sampleEmbeddings) {
        const score = cosineSimilarity(probeEmbedding, sample);
        if (score > maxChildScore) {
          maxChildScore = score;
        }
      }

      if (maxChildScore > highestScore) {
        runnerUpScore = highestScore;
        highestScore = maxChildScore;
        bestMatch = prof;
      } else if (maxChildScore > runnerUpScore) {
        runnerUpScore = maxChildScore;
      }
    }

    const margin = highestScore - (runnerUpScore > 0 ? runnerUpScore : 0);
    // Threshold check (cosine similarity typically > 0.82 for positive face match)
    const matched = highestScore >= 0.80 && (profiles.length === 1 || margin >= 0.05);

    return res.json({
      recognized: matched,
      matchedChildId: matched && bestMatch ? bestMatch.id : null,
      confidence: Math.round(highestScore * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      bestProfileName: bestMatch?.name || null,
      method: "embedding",
    });
  }

  // 2. If OpenAI key is configured and image base64 is provided, we can use vision verification
  if (config.openaiKey && probeImageBase64) {
    try {
      const prompt = `You are a strict face verification system for children's profiles on a learning tablet.
Compare this probe photo against the known profiles of children: ${profiles.map((p, i) => `Child ${i + 1}: ID="${p.id}", Name="${p.name}"`).join("; ")}.
Determine which child's face is shown. Return JSON only:
{"recognized": true/false, "matchedChildId": "<id or null>", "confidence": 0.0 to 1.0, "reason": "short explanation"}`;

      const response = await fetch(`${config.openaiBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiKey}`,
        },
        body: JSON.stringify({
          model: config.chatModel || "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: probeImageBase64.startsWith("data:") ? probeImageBase64 : `data:image/jpeg;base64,${probeImageBase64}` },
                },
              ],
            },
          ],
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content || "{}");
        return res.json({
          recognized: !!parsed.recognized,
          matchedChildId: parsed.matchedChildId || null,
          confidence: Number(parsed.confidence) || 0.85,
          method: "vision-ai",
        });
      }
    } catch (err) {
      console.warn("[face] Vision AI error:", err.message);
    }
  }

  return res.status(400).json({ error: "No valid probe embedding or image provided." });
});
