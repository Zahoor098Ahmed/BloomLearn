import * as ImageManipulator from "expo-image-manipulator";
import { decode as decodeJpeg } from "jpeg-js";
import { Buffer } from "buffer";
import type { ChildProfile } from "../types";

// Simulates on-device face recognition. In production, swap captureEmbedding()
// to run MobileFaceNet via react-native-fast-tflite (128-dim float vector) on
// the captured frame. The cosine similarity comparison logic below is
// production-ready.
//
// The proxy embedding needs actual pixel values to stay stable across repeat
// captures of the same face, so the photo is downscaled to a tiny fixed size
// and then decoded back to raw RGBA pixels — sampling a JPEG/PNG file's
// compressed bytes directly (instead of decoded pixels) is unusable because
// block-based entropy coding turns small pixel differences into large,
// unpredictable byte-level differences.
export const SIMILARITY_THRESHOLD = 0.5;

const EMBEDDING_SIZE = 48;

export async function captureEmbedding(photoUri: string): Promise<number[]> {
  const resized = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ resize: { width: EMBEDDING_SIZE, height: EMBEDDING_SIZE } }],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG }
  );
  if (!resized.base64) return [];

  const jpegBytes = Buffer.from(resized.base64, "base64");
  const { data, width, height } = decodeJpeg(jpegBytes, { useTArray: true });

  const pixelCount = width * height;
  const embedding: number[] = [];
  for (let i = 0; i < 128; i++) {
    const pixelIdx = Math.floor((i / 128) * pixelCount);
    const byteIdx = pixelIdx * 4;
    const gray = (data[byteIdx] + data[byteIdx + 1] + data[byteIdx + 2]) / 3;
    embedding.push(gray / 255 - 0.5);
  }
  return normalize(embedding);
}

function normalize(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return mag === 0 ? vec : vec.map((v) => v / mag);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

export function findMatch(
  embedding: number[],
  children: ChildProfile[]
): { child: ChildProfile; score: number } | null {
  let best: { child: ChildProfile; score: number } | null = null;
  let bestOverall: { child: ChildProfile; score: number } | null = null;
  for (const child of children) {
    if (!child.embedding?.length) continue;
    const score = cosineSimilarity(embedding, child.embedding);
    if (!bestOverall || score > bestOverall.score) bestOverall = { child, score };
    if (score >= SIMILARITY_THRESHOLD && (!best || score > best.score)) {
      best = { child, score };
    }
  }
  if (bestOverall) {
    console.log(`[faceEngine] best match: ${bestOverall.child.name} score=${bestOverall.score.toFixed(3)} (threshold ${SIMILARITY_THRESHOLD})`);
  }
  return best;
}
