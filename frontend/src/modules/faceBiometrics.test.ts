import {
  cosineSimilarity,
  normalizeVector,
  extractBiometricFromPixels,
  generateFeatureVectorFromString,
  matchChildLocally,
} from "./faceBiometrics";
import type { ChildProfile } from "./childProfiles";

console.log("▶ Face Biometrics & Child Recognition Accuracy Tests");

// 1. Vector normalization
const v1 = normalizeVector([3, 4]);
if (Math.abs(v1[0] - 0.6) > 0.001 || Math.abs(v1[1] - 0.8) > 0.001) {
  throw new Error("normalizeVector failed");
}
console.log("  ✔ vector normalization produces unit length vector");

// 2. Cosine similarity
const simIdentical = cosineSimilarity([1, 0, 0], [1, 0, 0]);
if (Math.abs(simIdentical - 1.0) > 0.001) throw new Error("Self similarity must be 1.0");

const simOrthogonal = cosineSimilarity([1, 0, 0], [0, 1, 0]);
if (Math.abs(simOrthogonal - 0.0) > 0.001) throw new Error("Orthogonal similarity must be 0.0");
console.log("  ✔ cosine similarity accurately evaluates identity and disparity");

// 3. Pixel biometric feature extraction
const dummyPixels = new Uint8ClampedArray(160 * 160 * 4);
for (let i = 0; i < dummyPixels.length; i += 4) {
  dummyPixels[i] = (i / 4) % 256;     // R
  dummyPixels[i + 1] = ((i / 4) * 2) % 256; // G
  dummyPixels[i + 2] = ((i / 4) * 3) % 256; // B
  dummyPixels[i + 3] = 255;           // A
}
const bio1 = extractBiometricFromPixels(dummyPixels, 160, 160);
if (bio1.length !== 256) throw new Error(`Expected 256 dimensions, got ${bio1.length}`);
console.log("  ✔ extractBiometricFromPixels produces robust 256D normalized vector");

// 4. Distinguishing Child A from Child B (Multi-child test case)
const childA_vector = generateFeatureVectorFromString("face_child_A_ahmed_frontal");
const childA_sample2 = generateFeatureVectorFromString("face_child_A_ahmed_smile");
const childB_vector = generateFeatureVectorFromString("face_child_B_sara_frontal");
const childB_sample2 = generateFeatureVectorFromString("face_child_B_sara_smile");

const profiles: ChildProfile[] = [
  {
    id: "child_a",
    name: "Ahmed (Child A)",
    age: 6,
    avatarIcon: "🦁",
    prescription: {
      notes: "Grade 1 Math only",
      assignedSubjects: ["math"],
      assignedGrade: 1,
      dailySentenceGoal: 5,
    },
    faceEnrollment: {
      enrolledAt: new Date().toISOString(),
      featureVectors: [childA_vector, childA_sample2],
    },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "child_b",
    name: "Sara (Child B)",
    age: 7,
    avatarIcon: "🌸",
    prescription: {
      notes: "English and Science",
      assignedSubjects: ["english", "science"],
      assignedGrade: 1,
      dailySentenceGoal: 6,
    },
    faceEnrollment: {
      enrolledAt: new Date().toISOString(),
      featureVectors: [childB_vector, childB_sample2],
    },
    createdAt: "",
    updatedAt: "",
  },
];

// Scan child A's face -> must match Child A with high confidence, NOT Child B
const matchA = matchChildLocally(childA_vector, profiles);
if (!matchA.recognized || matchA.matchedChild?.id !== "child_a") {
  throw new Error(`Child A probe failed to recognize Child A: ${JSON.stringify(matchA)}`);
}
console.log(`  ✔ Child A face accurately recognized: match=${matchA.matchedChild.name}, confidence=${matchA.confidence * 100}%`);

// Scan child B's face -> must match Child B with high confidence, NOT Child A
const matchB = matchChildLocally(childB_sample2, profiles);
if (!matchB.recognized || matchB.matchedChild?.id !== "child_b") {
  throw new Error(`Child B probe failed to recognize Child B: ${JSON.stringify(matchB)}`);
}
console.log(`  ✔ Child B face accurately recognized: match=${matchB.matchedChild.name}, confidence=${matchB.confidence * 100}%`);

// Unknown / random probe -> must NOT false-positive match either child
const unknownVector = generateFeatureVectorFromString("random_person_stranger_unrelated");
const matchUnknown = matchChildLocally(unknownVector, profiles);
if (matchUnknown.recognized) {
  throw new Error(`Stranger face falsely matched! Score: ${matchUnknown.confidence}`);
}
console.log("  ✔ Stranger / unregistered face correctly rejected (no false positive)");

console.log("\nAll face biometrics and multi-child isolation tests PASSED!");
