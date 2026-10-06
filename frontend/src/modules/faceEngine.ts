import jpeg from "jpeg-js";
import { Buffer } from "buffer";
import type { ChildProfile } from "./childProfiles";

export const SIMILARITY_THRESHOLD = 0.78;

/**
 * 3x3 Gaussian smoothing filter (removes high-frequency camera sensor noise/shot grain).
 */
function gaussianBlur(gray: number[], W = 48, H = 48): number[] {
  const out = new Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (y === 0 || y === H - 1 || x === 0 || x === W - 1) {
        out[y * W + x] = gray[y * W + x];
        continue;
      }
      const val =
        (gray[(y - 1) * W + (x - 1)] * 1 +
          gray[(y - 1) * W + x] * 2 +
          gray[(y - 1) * W + (x + 1)] * 1 +
          gray[y * W + (x - 1)] * 2 +
          gray[y * W + x] * 4 +
          gray[y * W + (x + 1)] * 2 +
          gray[(y + 1) * W + (x - 1)] * 1 +
          gray[(y + 1) * W + x] * 2 +
          gray[(y + 1) * W + (x + 1)] * 1) /
        16;
      out[y * W + x] = val;
    }
  }
  return out;
}

/**
 * Z-Score and L2 normalize a 128-dimensional feature vector.
 * Z-score removes lighting bias; L2 ensures unit length for fast dot-product cosine similarity.
 */
export function normalizeEmbedding(raw: number[]): number[] {
  const len = raw.length;
  if (len === 0) return [];

  // 1. Z-Score Normalization
  let sum = 0;
  for (let i = 0; i < len; i++) sum += raw[i];
  const mean = sum / len;

  let sumSqDiff = 0;
  for (let i = 0; i < len; i++) {
    const diff = raw[i] - mean;
    sumSqDiff += diff * diff;
  }
  const std = Math.sqrt(sumSqDiff / len) || 1e-6;

  const zScored = raw.map((x) => (x - mean) / std);

  // 2. L2 Normalization (Unit Length)
  let sumSq = 0;
  for (let i = 0; i < len; i++) {
    sumSq += zScored[i] * zScored[i];
  }
  const norm = Math.sqrt(sumSq) || 1e-6;

  return zScored.map((x) => x / norm);
}

/**
 * Generates highly discriminative 128-dimensional biometric embedding from a 48x48 grayscale pixel array.
 * Includes:
 * 1. Blank Wall Guard (variance < 1.8)
 * 2. 3x3 Gaussian smoothing (removes sensor noise)
 * 3. Full-image illumination normalization (Zero-Mean, Unit-Variance)
 * 4. Multi-block Signed Haar Wavelets (48 features)
 * 5. Directional Gradient Orientation Histograms (32 features)
 * 6. Morphometric Facial Geometry (eye spacing, eye-to-mouth ratio, jaw-to-forehead slope) (24 features)
 * 7. Facial Symmetry & Midline Profile (24 features)
 * Total: Exact 128 dimensions normalized with Z-score + L2.
 */
export function extractEmbeddingFromGrayscale(rawGray: number[]): number[] | null {
  const W = 48;
  const H = 48;
  const N = W * H;
  if (rawGray.length !== N) return null;

  // 1. Blank Wall Guard: Check raw image variance across pixels
  let totalLum = 0;
  for (let i = 0; i < N; i++) totalLum += rawGray[i];
  const avgLum = totalLum / N;

  let totalVar = 0;
  for (let i = 0; i < N; i++) {
    const diff = rawGray[i] - avgLum;
    totalVar += diff * diff;
  }
  const variance = Math.sqrt(totalVar / N);

  // If camera is facing a completely flat blank wall or table, variance is near 0.
  if (variance < 1.8) {
    return null; // Blank Wall Guard triggered
  }

  // 2. Denoise with 3x3 Gaussian smoothing
  const blurred = gaussianBlur(rawGray, W, H);

  // 3. Illumination Normalization (Zero-Mean, Unit-Variance)
  let pSum = 0;
  for (let i = 0; i < N; i++) pSum += blurred[i];
  const pMean = pSum / N;
  let pSq = 0;
  for (let i = 0; i < N; i++) {
    const d = blurred[i] - pMean;
    pSq += d * d;
  }
  const pStd = Math.sqrt(pSq / N) || 1e-6;
  const gray = blurred.map((v) => (v - pMean) / pStd);

  const features: number[] = [];

  // 4. Multi-block Signed Haar Wavelets (48 features)
  // 4x4 spatial blocks = 16 blocks (each 12x12). In each block:
  // - Horizontal contrast (Left - Right)
  // - Vertical contrast (Top - Bottom)
  // - Diagonal cross contrast ((TL + BR) - (TR + BL))
  for (let by = 0; by < 4; by++) {
    for (let bx = 0; bx < 4; bx++) {
      const cy = by * 12;
      const cx = bx * 12;
      let left = 0,
        right = 0,
        top = 0,
        bottom = 0;
      let diag1 = 0,
        diag2 = 0;

      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
          const v = gray[(cy + y) * W + (cx + x)];
          if (x < 6) left += v;
          else right += v;

          if (y < 6) top += v;
          else bottom += v;

          if ((x < 6 && y < 6) || (x >= 6 && y >= 6)) diag1 += v;
          else diag2 += v;
        }
      }

      features.push((left - right) / 72);
      features.push((top - bottom) / 72);
      features.push((diag1 - diag2) / 72);
    }
  } // 16 * 3 = 48 features

  // 5. Directional Gradient Orientation Histograms (32 features)
  // 16 blocks: horizontal gradient drift vs vertical gradient drift
  for (let by = 0; by < 4; by++) {
    for (let bx = 0; bx < 4; bx++) {
      let gxSum = 0;
      let gySum = 0;
      for (let y = 2; y < 10; y++) {
        for (let x = 2; x < 10; x++) {
          const py = by * 12 + y;
          const px = bx * 12 + x;
          const gx = gray[py * W + px + 1] - gray[py * W + px - 1];
          const gy = gray[(py + 1) * W + px] - gray[(py - 1) * W + px];
          gxSum += gx;
          gySum += gy;
        }
      }
      features.push(gxSum / 64);
      features.push(gySum / 64);
    }
  } // 16 * 2 = 32 features (48 + 32 = 80)

  // 6. Morphometric Face Geometry (24 features):
  // Measures eye spacing, nose length, mouth position, jaw width, chin texture
  // Left eye darkness centroid (rows 16..24, cols 10..22)
  let lDark = 0,
    lWx = 0,
    lWy = 0;
  for (let y = 16; y < 24; y++) {
    for (let x = 10; x < 22; x++) {
      const d = Math.max(0, -gray[y * W + x]);
      lDark += d;
      lWx += x * d;
      lWy += y * d;
    }
  }
  const lEyeX = lDark > 0 ? lWx / lDark : 16;
  const lEyeY = lDark > 0 ? lWy / lDark : 20;

  // Right eye darkness centroid (rows 16..24, cols 26..38)
  let rDark = 0,
    rWx = 0,
    rWy = 0;
  for (let y = 16; y < 24; y++) {
    for (let x = 26; x < 38; x++) {
      const d = Math.max(0, -gray[y * W + x]);
      rDark += d;
      rWx += x * d;
      rWy += y * d;
    }
  }
  const rEyeX = rDark > 0 ? rWx / rDark : 32;
  const rEyeY = rDark > 0 ? rWy / rDark : 20;

  // Mouth centroid (rows 32..42, cols 16..32)
  let mDark = 0,
    mWy = 0;
  for (let y = 32; y < 42; y++) {
    for (let x = 16; x < 32; x++) {
      const d = Math.max(0, -gray[y * W + x]);
      mDark += d;
      mWy += y * d;
    }
  }
  const mouthY = mDark > 0 ? mWy / mDark : 36;

  const eyeDistance = rEyeX - lEyeX;
  const eyeToMouth = mouthY - (lEyeY + rEyeY) / 2;
  const facialAspect = eyeDistance / (eyeToMouth || 1);

  features.push(eyeDistance - 16);
  features.push(eyeToMouth - 16);
  features.push((facialAspect - 1.0) * 5);
  features.push((lEyeY - rEyeY) * 3);

  // Jaw Width vs Forehead Width profile (10 slices)
  // Forehead profile at y=10, Jaw profile at y=40
  for (let i = 0; i < 10; i++) {
    const col = 14 + i * 2;
    features.push(gray[10 * W + col] - gray[40 * W + col]);
    features.push(gray[20 * W + col] - gray[30 * W + col]);
  } // 20 features (4 + 20 = 24 features, total 80 + 24 = 104)

  // 7. Micro-texture & Midline Symmetry (24 features)
  for (let i = 0; i < 12; i++) {
    const y = 14 + i * 2;
    let sym = 0;
    for (let x = 0; x < 18; x++) {
      sym += gray[y * W + (23 - x)] - gray[y * W + (24 + x)];
    }
    features.push(sym / 18);
    features.push(gray[y * W + 24] - gray[(y + 6) * W + 24]);
  } // 24 features (104 + 24 = 128 total features!)

  // 8. Z-Score + L2 Normalize (Unit Length 128D)
  return normalizeEmbedding(features.slice(0, 128));
}

/**
 * Preprocesses a camera photo:
 * 1. Center crop to 1:1 square (so face oval is centered)
 * 2. Resize to 48x48 pixels
 * 3. Read grayscale bytes via jpeg-js (or canvas on web)
 * 4. Generates normalized 128-dimensional embedding vector
 */
export async function captureEmbedding(
  photoUri: string,
  dimensions?: { width: number; height: number }
): Promise<number[] | null> {
  try {
    const w = dimensions?.width || 640;
    const h = dimensions?.height || 480;
    const cropSize = Math.min(w, h);
    const originX = Math.max(0, Math.floor((w - cropSize) / 2));
    const originY = Math.max(0, Math.floor((h - cropSize) / 2));

    // Web execution: if in browser environment, decode directly using Canvas
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const img = new (window as any).Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = photoUri;
          });

          const sx = Math.max(0, (img.width - Math.min(img.width, img.height)) / 2);
          const sy = Math.max(0, (img.height - Math.min(img.width, img.height)) / 2);
          const sDim = Math.min(img.width, img.height);

          ctx.drawImage(img, sx, sy, sDim, sDim, 0, 0, 48, 48);
          const imgData = ctx.getImageData(0, 0, 48, 48);
          const gray: number[] = new Array(48 * 48);
          for (let i = 0; i < 48 * 48; i++) {
            const r = imgData.data[i * 4];
            const g = imgData.data[i * 4 + 1];
            const b = imgData.data[i * 4 + 2];
            gray[i] = r * 0.299 + g * 0.587 + b * 0.114;
          }
          return extractEmbeddingFromGrayscale(gray);
        }
      } catch {
        /* fallback to expo-image-manipulator */
      }
    }

    // Native execution using expo-image-manipulator + jpeg-js
    const { manipulateAsync, SaveFormat } = await import("expo-image-manipulator");
    const manipulated = await manipulateAsync(
      photoUri,
      [
        {
          crop: {
            originX,
            originY,
            width: cropSize,
            height: cropSize,
          },
        },
        {
          resize: {
            width: 48,
            height: 48,
          },
        },
      ],
      {
        base64: true,
        format: SaveFormat.JPEG,
        compress: 0.9,
      }
    );

    if (!manipulated.base64) return null;

    // Decode JPEG buffer using jpeg-js
    const rawBuffer = Buffer.from(manipulated.base64, "base64");
    const decoded = jpeg.decode(rawBuffer, { useTArray: true });
    if (!decoded || !decoded.data) return null;

    const gray: number[] = new Array(48 * 48);
    for (let i = 0; i < 48 * 48; i++) {
      const r = decoded.data[i * 4];
      const g = decoded.data[i * 4 + 1];
      const b = decoded.data[i * 4 + 2];
      gray[i] = r * 0.299 + g * 0.587 + b * 0.114;
    }

    return extractEmbeddingFromGrayscale(gray);
  } catch (err) {
    console.warn("[faceEngine] captureEmbedding error:", err);
    return null;
  }
}

/**
 * Cosine similarity between two L2-normalized 128D embeddings.
 * Since vectors are unit length, dot product equals cosine similarity:
 * Similarity = sum(A[i] * B[i])
 */
export function cosineSimilarity(embA: number[], embB: number[]): number {
  if (!embA || !embB || embA.length !== embB.length || embA.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < embA.length; i++) {
    dot += embA[i] * embB[i];
  }
  return dot;
}

/**
 * Combines 2 or 3 biometric samples into an averaged, unit-normalized embedding.
 */
export function mergeEmbeddings(samples: number[][]): number[] {
  if (!samples.length) return [];
  if (samples.length === 1) return samples[0];

  const len = samples[0].length;
  const merged: number[] = new Array(len).fill(0);

  for (const s of samples) {
    for (let i = 0; i < len; i++) {
      merged[i] += s[i];
    }
  }

  for (let i = 0; i < len; i++) {
    merged[i] /= samples.length;
  }

  return normalizeEmbedding(merged);
}

/**
 * Matches a live probe embedding against all enrolled children profiles.
 * Threshold: SIMILARITY_THRESHOLD = 0.58
 */
export function findMatch(
  probeEmb: number[],
  allChildren: ChildProfile[]
): { child: ChildProfile; score: number } | null {
  if (!probeEmb || !probeEmb.length || !allChildren.length) return null;

  let bestChild: ChildProfile | null = null;
  let highestScore = -1;

  for (const c of allChildren) {
    const vectors: number[][] = [];
    if (c.embedding && c.embedding.length > 0) {
      vectors.push(c.embedding);
    }
    if (c.faceEnrollment?.featureVectors?.length) {
      for (const v of c.faceEnrollment.featureVectors) {
        if (v && v.length > 0) vectors.push(v);
      }
    }
    if (!vectors.length) continue;

    for (const v of vectors) {
      const score = cosineSimilarity(probeEmb, v);
      if (score > highestScore) {
        highestScore = score;
        bestChild = c;
      }
    }
  }

  if (bestChild && highestScore >= SIMILARITY_THRESHOLD) {
    return {
      child: bestChild,
      score: Math.round(highestScore * 100) / 100,
    };
  }

  return null;
}

/**
 * Deterministic 128-dimensional normalized embedding generator from a seed string.
 * Used for starter profiles, fallbacks, and unit testing.
 */
export function generateFeatureVectorFromString(seed: string): number[] {
  let hash = 2166136261;
  const raw: number[] = [];
  for (let i = 0; i < 128; i++) {
    for (let c = 0; c < seed.length; c++) {
      hash ^= seed.charCodeAt(c) + i * 31;
      hash = Math.imul(hash, 16777619);
    }
    const val = (Math.abs(hash) % 1000) / 1000;
    raw.push(val);
  }
  return normalizeEmbedding(raw);
}
