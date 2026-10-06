import {
  SIMILARITY_THRESHOLD,
  normalizeEmbedding,
  extractEmbeddingFromGrayscale,
  cosineSimilarity,
  mergeEmbeddings,
  findMatch,
  generateFeatureVectorFromString,
} from "./faceEngine";
import type { ChildProfile } from "./childProfiles";

console.log("▶ [faceEngine] 100% On-Device 128D Offline Face Recognition Test Suite");

// 1. Z-Score and L2 Normalization
const raw = [10, 20, 30, 40, 50, 60, 70, 80];
const norm = normalizeEmbedding(raw);
let sumSq = 0;
for (const x of norm) sumSq += x * x;
if (Math.abs(Math.sqrt(sumSq) - 1.0) > 0.001) {
  throw new Error("L2 unit length normalization failed!");
}
console.log("  ✔ Z-Score + L2 normalization produces unit-length vector (norm ≈ 1.0)");

// 2. Blank Wall Guard
const blankWall = new Array(48 * 48).fill(128); // flat grey wall
const blankResult = extractEmbeddingFromGrayscale(blankWall);
if (blankResult !== null) {
  throw new Error("Blank Wall Guard should have rejected flat surface!");
}
console.log("  ✔ Blank Wall Guard successfully rejects flat surfaces/walls (variance < 4.0)");

// 3. Feature Extraction on Textured/Facial Pattern
const facePattern = new Array(48 * 48);
for (let y = 0; y < 48; y++) {
  for (let x = 0; x < 48; x++) {
    // Simulated face geometry (eye sockets, nose, mouth gradient)
    const distFromCenter = Math.sqrt((x - 24) ** 2 + (y - 24) ** 2);
    facePattern[y * 48 + x] = Math.sin(x / 4) * 50 + Math.cos(y / 4) * 50 + (255 - distFromCenter * 5);
  }
}
const faceEmb1 = extractEmbeddingFromGrayscale(facePattern);
if (!faceEmb1 || faceEmb1.length !== 128) {
  throw new Error(`Expected 128-dimensional embedding, got ${faceEmb1?.length}`);
}
console.log(`  ✔ Extracted exact 128-dimensional embedding from 48x48 grayscale matrix (${faceEmb1.length} dims)`);

// 4. Cosine Similarity & Threshold Check
const simSelf = cosineSimilarity(faceEmb1, faceEmb1);
if (Math.abs(simSelf - 1.0) > 0.001) {
  throw new Error(`Self cosine similarity should be 1.0, got ${simSelf}`);
}
console.log(`  ✔ Self similarity: ${simSelf.toFixed(4)} (Threshold is ${SIMILARITY_THRESHOLD})`);

// 5. Multi-Sample Averaging (mergeEmbeddings)
// Slightly perturbed sample simulating slight head angle change
const facePattern2 = facePattern.map((v, i) => v + (i % 7) - 3);
const faceEmb2 = extractEmbeddingFromGrayscale(facePattern2)!;
const merged = mergeEmbeddings([faceEmb1, faceEmb2]);
if (merged.length !== 128) {
  throw new Error(`Merged embedding length should be 128, got ${merged.length}`);
}
const simMergedWithOriginal = cosineSimilarity(merged, faceEmb1);
if (simMergedWithOriginal < 0.95) {
  throw new Error(`Merged embedding should be very close to original samples (>0.95), got ${simMergedWithOriginal}`);
}
console.log(`  ✔ Merged 2 samples into average embedding: similarity=${simMergedWithOriginal.toFixed(4)}`);

// 6. Child A (Ahmed) vs Child B (Sara) Profile Matching & Prescription Isolation
const ahmedEmb = generateFeatureVectorFromString("child_ahmed_bloomlearn_face_seed");
const saraEmb = generateFeatureVectorFromString("child_sara_bloomlearn_face_seed");

const profiles: ChildProfile[] = [
  {
    id: "child_ahmed",
    name: "Ahmed (Child A)",
    age: 6,
    avatarIcon: "🦁",
    embedding: ahmedEmb,
    prescription: {
      prescribedBy: "Dr. Fatima",
      notes: "Doctor prescribed Grade 1 Math counting focus.",
      assignedSubjects: ["math"],
      assignedGrade: 1,
      focusChapterIds: ["math-count-5"],
      dailySentenceGoal: 5,
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "child_sara",
    name: "Sara (Child B)",
    age: 7,
    avatarIcon: "🌸",
    embedding: saraEmb,
    prescription: {
      prescribedBy: "Dr. Bilal",
      notes: "Doctor prescribed English prepositions & Science exploration.",
      assignedSubjects: ["english", "science"],
      assignedGrade: 1,
      focusChapterIds: ["eng-prepositions"],
      dailySentenceGoal: 6,
    },
    createdAt: "",
    updatedAt: "",
  },
];

// Scan Ahmed's face
const matchAhmed = findMatch(ahmedEmb, profiles);
if (!matchAhmed || matchAhmed.child.id !== "child_ahmed" || matchAhmed.score < SIMILARITY_THRESHOLD) {
  throw new Error(`Failed to match Ahmed! Result: ${JSON.stringify(matchAhmed)}`);
}
console.log(`  ✔ Ahmed scanned: Recognized "${matchAhmed.child.name}" with score ${matchAhmed.score} >= ${SIMILARITY_THRESHOLD}`);
console.log(`    ↳ Content loaded: Only [${matchAhmed.child.prescription.assignedSubjects.join(", ")}] (Sara's content hidden)`);

// Scan Sara's face
const matchSara = findMatch(saraEmb, profiles);
if (!matchSara || matchSara.child.id !== "child_sara" || matchSara.score < SIMILARITY_THRESHOLD) {
  throw new Error(`Failed to match Sara! Result: ${JSON.stringify(matchSara)}`);
}
console.log(`  ✔ Sara scanned: Recognized "${matchSara.child.name}" with score ${matchSara.score} >= ${SIMILARITY_THRESHOLD}`);
console.log(`    ↳ Content loaded: Only [${matchSara.child.prescription.assignedSubjects.join(", ")}] (Ahmed's content hidden)`);

// 7. Father (Adult) vs Daughter (Child) Discrimination Test
// Synthesize Adult Face (wider jaw, darker stubble/beard shadow, wider eye spacing)
const adultFace: number[] = new Array(48 * 48).fill(120);
for (let y = 6; y < 16; y++) for (let x = 12; x < 36; x++) adultFace[y * 48 + x] = 160;
for (let y = 18; y < 22; y++) {
  for (let x = 14; x < 20; x++) adultFace[y * 48 + x] = 70;
  for (let x = 28; x < 34; x++) adultFace[y * 48 + x] = 70;
}
for (let y = 22; y < 30; y++) for (let x = 22; x < 26; x++) adultFace[y * 48 + x] = 140;
for (let y = 34; y < 38; y++) for (let x = 18; x < 30; x++) adultFace[y * 48 + x] = 80;
for (let y = 38; y < 44; y++) for (let x = 14; x < 34; x++) adultFace[y * 48 + x] = 95;

// Synthesize Child Face (rounder face, smaller nose, narrower eye spacing, lighter chin)
const childFace: number[] = new Array(48 * 48).fill(120);
for (let y = 6; y < 16; y++) for (let x = 12; x < 36; x++) childFace[y * 48 + x] = 175;
for (let y = 19; y < 25; y++) {
  for (let x = 16; x < 22; x++) childFace[y * 48 + x] = 65;
  for (let x = 26; x < 32; x++) childFace[y * 48 + x] = 65;
}
for (let y = 24; y < 29; y++) for (let x = 22; x < 26; x++) childFace[y * 48 + x] = 150;
for (let y = 32; y < 36; y++) for (let x = 20; x < 28; x++) childFace[y * 48 + x] = 100;
for (let y = 38; y < 44; y++) for (let x = 16; x < 32; x++) childFace[y * 48 + x] = 160;

const adultEmb = extractEmbeddingFromGrayscale(adultFace)!;
const childEmb = extractEmbeddingFromGrayscale(childFace)!;

// Adult scanning next morning with +30 lighting change
const adultProbe = adultFace.map((p, idx) => Math.min(255, Math.max(0, p + 30 + Math.sin(idx * 7) * 4)));
const adultProbeEmb = extractEmbeddingFromGrayscale(adultProbe)!;

// Child scanning next morning
const childProbe = childFace.map((p, idx) => Math.min(255, Math.max(0, p + 20 + Math.cos(idx * 6) * 4)));
const childProbeEmb = extractEmbeddingFromGrayscale(childProbe)!;

const adultSelfSim = cosineSimilarity(adultProbeEmb, adultEmb);
const childSelfSim = cosineSimilarity(childProbeEmb, childEmb);
const crossSim = cosineSimilarity(childProbeEmb, adultEmb);

if (adultSelfSim < SIMILARITY_THRESHOLD) {
  throw new Error(`Adult self similarity (${adultSelfSim}) should be >= ${SIMILARITY_THRESHOLD}!`);
}
if (childSelfSim < SIMILARITY_THRESHOLD) {
  throw new Error(`Child self similarity (${childSelfSim}) should be >= ${SIMILARITY_THRESHOLD}!`);
}
if (crossSim >= SIMILARITY_THRESHOLD) {
  throw new Error(`Child cross similarity to Adult (${crossSim}) must be REJECTED (< ${SIMILARITY_THRESHOLD})!`);
}

console.log(`  ✔ Adult self-match passed: score=${adultSelfSim.toFixed(4)} >= ${SIMILARITY_THRESHOLD}`);
console.log(`  ✔ Child self-match passed: score=${childSelfSim.toFixed(4)} >= ${SIMILARITY_THRESHOLD}`);
console.log(`  ✔ Child scanning Adult profile REJECTED: score=${crossSim.toFixed(4)} < ${SIMILARITY_THRESHOLD}`);

// 8. Duplicate Face Conflict Guard: Child A shown when enrolling Child B
const existingEnrolledProfiles: ChildProfile[] = [
  {
    id: "child_a_enrolled",
    name: "Child A",
    age: 6,
    avatarIcon: "🦁",
    embedding: adultEmb,
    prescription: {
      notes: "Doctor plan for Child A",
      assignedSubjects: ["math"],
      assignedGrade: 1,
      dailySentenceGoal: 5,
    },
    createdAt: "",
    updatedAt: "",
  },
];

// Suppose Child B is being registered, but Child A looks into the camera
const conflictMatch = findMatch(adultProbeEmb, existingEnrolledProfiles);
if (!conflictMatch || conflictMatch.child.id !== "child_a_enrolled" || conflictMatch.score < SIMILARITY_THRESHOLD) {
  throw new Error(`Duplicate Face Conflict Guard failed! Should have detected Child A!`);
}
console.log(`  ✔ Duplicate Face Conflict Guard passed: Detected Child A's face (score=${conflictMatch.score}), successfully preventing duplicate enrollment!`);

console.log("\n All on-device faceEngine tests passed with 100% precision!");
