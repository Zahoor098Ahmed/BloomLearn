import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Grade, SubjectId } from "./curriculum";
import { switchChildForProgress } from "./progress";
import { switchChildForHistory } from "./history";

import { generateFeatureVectorFromString } from "./faceEngine";

export interface DoctorPrescription {
  /** Doctor or therapist clinical guidance/notes. */
  notes: string;
  /** Name or title of doctor/therapist. */
  prescribedBy?: string;
  /** Allowed/assigned subjects for this child (e.g. ['math'] or ['english', 'science']). */
  assignedSubjects: SubjectId[];
  /** Assigned grade level (1..5). */
  assignedGrade: Grade;
  /** Specific chapter IDs recommended by doctor for therapy/focus (e.g. ['math-count-5', 'eng-prepositions']). */
  focusChapterIds?: string[];
  /** Target sentences per day. */
  dailySentenceGoal: number;
  /** Custom speech rate if child needs slower pronunciation. */
  speechRate?: number;
}

export interface FaceEnrollment {
  enrolledAt: string;
  photoUri?: string;
  /** Multi-sample biometric feature vectors for robust, high-accuracy recognition. */
  featureVectors: number[][];
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarIcon: string;
  photoUrl?: string;
  embedding?: number[]; // [0.12, -0.45, 0.88, ...] (128 floats from faceEngine)
  isStarter?: boolean;
  biometricVersion?: number;
  prescription: DoctorPrescription;
  faceEnrollment?: FaceEnrollment;
  createdAt: string;
  updatedAt: string;
}

const PROFILES_KEY = "bloomlearn_child_profiles";
const ACTIVE_CHILD_KEY = "bloomlearn_active_child_id";

let cachedProfiles: ChildProfile[] = [];
let cachedActiveId: string | null = null;
let loaded = false;

const activeListeners = new Set<(profile: ChildProfile | null) => void>();
const profileListListeners = new Set<(profiles: ChildProfile[]) => void>();

export function subscribeActiveChild(cb: (profile: ChildProfile | null) => void): () => void {
  activeListeners.add(cb);
  return () => {
    activeListeners.delete(cb);
  };
}

export function subscribeProfiles(cb: (profiles: ChildProfile[]) => void): () => void {
  profileListListeners.add(cb);
  return () => {
    profileListListeners.delete(cb);
  };
}

function notifyListeners() {
  const active = getActiveProfile();
  for (const cb of activeListeners) {
    try {
      cb(active);
    } catch {
      /* ignore */
    }
  }
  for (const cb of profileListListeners) {
    try {
      cb([...cachedProfiles]);
    } catch {
      /* ignore */
    }
  }
}

/** Pre-configured seed profiles for initial demonstration (Child A and Child B). */
export function createStarterProfiles(): ChildProfile[] {
  const now = new Date().toISOString();
  const ahmedEmb = generateFeatureVectorFromString("bloomlearn_child_a_ahmed_seed");
  const saraEmb = generateFeatureVectorFromString("bloomlearn_child_b_sara_seed");

  return [
    {
      id: "child_a_ahmed",
      name: "Ahmed (Child A)",
      age: 6,
      avatarIcon: "🦁",
      isStarter: true,
      embedding: ahmedEmb,
      prescription: {
        prescribedBy: "Dr. Fatima (Speech & Math Clinic)",
        notes: "Doctor prescribed focus on Grade 1 Math & visual counting. Do daily counting sums.",
        assignedSubjects: ["math"],
        assignedGrade: 1,
        focusChapterIds: ["math-count-5", "math-add-5"],
        dailySentenceGoal: 5,
        speechRate: 0.85,
      },
      faceEnrollment: {
        enrolledAt: now,
        featureVectors: [ahmedEmb],
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "child_b_sara",
      name: "Sara (Child B)",
      age: 7,
      avatarIcon: "🌸",
      isStarter: true,
      embedding: saraEmb,
      prescription: {
        prescribedBy: "Dr. Bilal (Language Therapy)",
        notes: "Doctor prescribed English prepositions, sentence formation, and Science exploration.",
        assignedSubjects: ["english", "science"],
        assignedGrade: 1,
        focusChapterIds: ["eng-prepositions", "sci-senses"],
        dailySentenceGoal: 6,
        speechRate: 0.88,
      },
      faceEnrollment: {
        enrolledAt: now,
        featureVectors: [saraEmb],
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export async function loadProfiles(): Promise<ChildProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    if (raw) {
      cachedProfiles = JSON.parse(raw);
      // Auto-migrate to high-accuracy Version 2 biometrics if photo exists
      let migrated = false;
      for (const p of cachedProfiles) {
        if (p.photoUrl && p.biometricVersion !== 2) {
          try {
            const { captureEmbedding } = await import("./faceEngine");
            const newVec = await captureEmbedding(p.photoUrl);
            if (newVec) {
              p.embedding = newVec;
              if (p.faceEnrollment) {
                p.faceEnrollment.featureVectors = [newVec];
              }
              p.biometricVersion = 2;
              migrated = true;
            }
          } catch {
            // Keep existing embedding if photo is unreadable
          }
        }
      }
      if (migrated) {
        await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(cachedProfiles));
      }
    } else {
      // Seed initial profiles so parents immediately see Child A & Child B with doctor plans
      cachedProfiles = createStarterProfiles();
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(cachedProfiles));
    }

    const activeId = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
    cachedActiveId = activeId || (cachedProfiles[0]?.id ?? null);
    if (cachedActiveId) {
      await switchChildForProgress(cachedActiveId);
      await switchChildForHistory(cachedActiveId);
    }
    loaded = true;
  } catch {
    cachedProfiles = [];
    cachedActiveId = null;
  }
  return cachedProfiles;
}

export function getCachedProfiles(): ChildProfile[] {
  return cachedProfiles;
}

export function getActiveProfile(): ChildProfile | null {
  if (!cachedActiveId) return cachedProfiles[0] ?? null;
  return cachedProfiles.find((p) => p.id === cachedActiveId) ?? cachedProfiles[0] ?? null;
}

export function getActiveChildId(): string | null {
  return cachedActiveId;
}

export async function setActiveChild(childId: string | null): Promise<void> {
  cachedActiveId = childId;
  try {
    if (childId) {
      await AsyncStorage.setItem(ACTIVE_CHILD_KEY, childId);
    } else {
      await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
    }
  } catch {
    /* ignore */
  }
  await switchChildForProgress(childId);
  await switchChildForHistory(childId);
  notifyListeners();
}

export async function saveProfile(profile: ChildProfile): Promise<ChildProfile> {
  const existingIdx = cachedProfiles.findIndex((p) => p.id === profile.id);
  const updated: ChildProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    cachedProfiles[existingIdx] = updated;
  } else {
    // If parent is enrolling their own real child, remove demo/starter profiles
    // so parents only see their own family children!
    if (!profile.isStarter) {
      cachedProfiles = cachedProfiles.filter(
        (p) => !p.isStarter && p.id !== "child_a_ahmed" && p.id !== "child_b_sara"
      );
    }
    cachedProfiles.push(updated);
  }

  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(cachedProfiles));
  } catch {
    /* ignore */
  }

  if (cachedActiveId === updated.id || cachedProfiles.length === 1) {
    await setActiveChild(updated.id);
  } else {
    notifyListeners();
  }

  return updated;
}

export async function deleteProfile(id: string): Promise<void> {
  cachedProfiles = cachedProfiles.filter((p) => p.id !== id);
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(cachedProfiles));
  } catch {
    /* ignore */
  }

  if (cachedActiveId === id) {
    const next = cachedProfiles[0]?.id ?? null;
    await setActiveChild(next);
  } else {
    notifyListeners();
  }
}

/** Remove starter demonstration profiles (Ahmed & Sara) so only the parent's children exist. */
export async function clearStarterProfiles(): Promise<void> {
  cachedProfiles = cachedProfiles.filter(
    (p) => !p.isStarter && p.id !== "child_a_ahmed" && p.id !== "child_b_sara"
  );
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(cachedProfiles));
  } catch {
    /* ignore */
  }
  const next = cachedProfiles[0]?.id ?? null;
  await setActiveChild(next);
  notifyListeners();
}

export function hasOnlyStarterProfiles(): boolean {
  if (cachedProfiles.length === 0) return false;
  return cachedProfiles.every(
    (p) => p.isStarter || p.id === "child_a_ahmed" || p.id === "child_b_sara"
  );
}
