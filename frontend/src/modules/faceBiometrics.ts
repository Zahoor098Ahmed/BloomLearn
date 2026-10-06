import { getKey } from "./apiKeys";
import type { ChildProfile } from "./childProfiles";

export interface RecognitionResult {
  recognized: boolean;
  matchedChild: ChildProfile | null;
  confidence: number;
  margin: number;
  method: "local-biometric" | "backend-ai" | "fallback";
}

/**
 * Computes Cosine Similarity between two L2-normalized vectors.
 * Returns value between -1.0 and 1.0 (typically 0.0 to 1.0 for feature vectors).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
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
 * Normalizes a raw numeric vector to unit length (L2 norm).
 */
export function normalizeVector(v: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < v.length; i++) {
    sumSq += v[i] * v[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

/**
 * Extract biometric descriptor from an RGBA pixel array (width x height).
 * Uses multi-zone spatial gradient orientation and chrominance histogram (HOG-style).
 * Produces a robust, normalized 128-dimensional biometric descriptor.
 */
export function extractBiometricFromPixels(
  rgba: Uint8ClampedArray | number[],
  width: number,
  height: number
): number[] {
  const gridSize = 8; // 8x8 zones
  const numOrientationBins = 8;
  const features: number[] = [];

  // Convert to grayscale grid & calculate gradients
  const gray: number[] = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const cellW = Math.max(1, Math.floor(width / gridSize));
  const cellH = Math.max(1, Math.floor(height / gridSize));

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let cellMeanLum = 0;
      let count = 0;
      let maxGrad = 0;
      const bins = new Array(numOrientationBins).fill(0);

      const startX = gx * cellW;
      const endX = Math.min(width - 1, startX + cellW);
      const startY = gy * cellH;
      const endY = Math.min(height - 1, startY + cellH);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = y * width + x;
          const lum = gray[idx];
          cellMeanLum += lum;
          count++;

          // Spatial Sobel-like gradients
          const left = x > 0 ? gray[idx - 1] : lum;
          const right = x < width - 1 ? gray[idx + 1] : lum;
          const up = y > 0 ? gray[idx - width] : lum;
          const down = y < height - 1 ? gray[idx + width] : lum;

          const dx = right - left;
          const dy = down - up;
          const mag = Math.sqrt(dx * dx + dy * dy);
          if (mag > maxGrad) maxGrad = mag;

          let angle = Math.atan2(dy, dx); // -pi to pi
          if (angle < 0) angle += 2 * Math.PI;
          const bin = Math.min(numOrientationBins - 1, Math.floor((angle / (2 * Math.PI)) * numOrientationBins));
          bins[bin] += mag;
        }
      }

      // Append cell intensity, contrast, and dominant gradient
      const avgLum = count > 0 ? cellMeanLum / count : 128;
      features.push(avgLum / 255);
      features.push(Math.min(1, maxGrad / 150));
      // Top 2 gradient bins
      const sortedBins = [...bins].sort((a, b) => b - a);
      features.push(Math.min(1, sortedBins[0] / (count * 20 + 1)));
      features.push(Math.min(1, sortedBins[1] / (count * 20 + 1)));
    }
  }

  // Length will be 8 * 8 * 4 = 256 dimensions
  return normalizeVector(features);
}

/**
 * Generates a synthetic biometric vector from an image seed / base64 string
 * when direct raw pixel buffers are not accessible on older runtimes.
 */
export function generateFeatureVectorFromString(seed: string): number[] {
  const vec: number[] = new Array(128).fill(0);
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h = (h ^ seed.charCodeAt(i)) * 0x01000193;
    const idx = (h >>> 0) % 128;
    vec[idx] = (vec[idx] + (h & 0xff) / 255) % 1.0;
  }
  return normalizeVector(vec);
}

/**
 * Match a probe feature vector against all enrolled child profiles.
 * Applies high discrimination threshold and margin separation to prevent cross-child false positives.
 */
export function matchChildLocally(
  probeVector: number[],
  profiles: ChildProfile[]
): RecognitionResult {
  if (!probeVector || probeVector.length === 0 || profiles.length === 0) {
    return { recognized: false, matchedChild: null, confidence: 0, margin: 0, method: "local-biometric" };
  }

  let bestChild: ChildProfile | null = null;
  let highestScore = -1;
  let runnerUpScore = -1;

  for (const prof of profiles) {
    const vectors = prof.faceEnrollment?.featureVectors || [];
    if (vectors.length === 0) continue;

    let childMax = -1;
    for (const v of vectors) {
      const score = cosineSimilarity(probeVector, v);
      if (score > childMax) childMax = score;
    }

    if (childMax > highestScore) {
      runnerUpScore = highestScore;
      highestScore = childMax;
      bestChild = prof;
    } else if (childMax > runnerUpScore) {
      runnerUpScore = childMax;
    }
  }

  if (!bestChild) {
    return { recognized: false, matchedChild: null, confidence: 0, margin: 0, method: "local-biometric" };
  }

  const margin = runnerUpScore > 0 ? highestScore - runnerUpScore : highestScore;
  // Threshold: must be at least 0.78 similarity and (if multiple profiles exist) have a distinct gap
  const passedThreshold = highestScore >= 0.78;
  const passedMargin = profiles.length <= 1 || margin >= 0.04;

  const recognized = passedThreshold && passedMargin;

  return {
    recognized,
    matchedChild: recognized ? bestChild : null,
    confidence: Math.round(highestScore * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    method: "local-biometric",
  };
}

/**
 * Optional server-assisted recognition if backend is configured and reachable.
 */
export async function matchChildWithBackend(
  probeEmbedding: number[] | undefined,
  probeImageBase64: string | undefined,
  profiles: ChildProfile[]
): Promise<RecognitionResult | null> {
  const proxyUrl = getKey("proxyUrl");
  const proxyToken = getKey("proxyToken");
  if (!proxyUrl) return null;

  try {
    const payloadProfiles = profiles.map((p) => ({
      id: p.id,
      name: p.name,
      embeddings: p.faceEnrollment?.featureVectors || [],
      photoBase64: p.faceEnrollment?.photoUri,
    }));

    const res = await fetch(`${proxyUrl.replace(/\/+$/, "")}/face/recognize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(proxyToken ? { Authorization: `Bearer ${proxyToken}` } : {}),
      },
      body: JSON.stringify({
        probeEmbedding,
        probeImageBase64,
        profiles: payloadProfiles,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.recognized === "boolean") {
      const matched = profiles.find((p) => p.id === data.matchedChildId) ?? null;
      return {
        recognized: data.recognized && !!matched,
        matchedChild: matched,
        confidence: Number(data.confidence) || 0,
        margin: Number(data.margin) || 0,
        method: "backend-ai",
      };
    }
  } catch {
    // Offline or unreachable — local biometric engine handles it
  }
  return null;
}
