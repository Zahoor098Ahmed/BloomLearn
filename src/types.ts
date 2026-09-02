export type DiagnosisType =
  | 'autism'
  | 'down-syndrome'
  | 'speech-delay'
  | 'adhd'
  | 'hearing-impairment'
  | 'visual-impairment'
  | 'dyslexia'
  | 'cerebral-palsy'
  | 'intellectual-disability'
  | 'sensory-processing'
  | 'non-verbal'
  | 'general';

export const DIAGNOSIS_LABELS: Record<DiagnosisType, string> = {
  'autism': 'Autism (ASD)',
  'down-syndrome': 'Down Syndrome',
  'speech-delay': 'Speech / Language Delay',
  'adhd': 'ADHD',
  'hearing-impairment': 'Hearing Impairment',
  'visual-impairment': 'Visual Impairment',
  'dyslexia': 'Dyslexia / Learning Disability',
  'cerebral-palsy': 'Cerebral Palsy / Motor Difficulty',
  'intellectual-disability': 'Intellectual Disability',
  'sensory-processing': 'Sensory Processing Disorder',
  'non-verbal': 'Non-verbal',
  'general': 'General Special Needs',
};

export type ContentTag =
  | 'colors' | 'numbers' | 'shapes' | 'animals' | 'music'
  | 'stories' | 'aac' | 'breathing' | 'schedule' | 'social'
  | 'motor' | 'speech' | 'art' | 'nature';

export const CONTENT_TAG_LABELS: Record<ContentTag, string> = {
  colors: '🎨 Colors',
  numbers: '🔢 Numbers',
  shapes: '🔷 Shapes',
  animals: '🐾 Animals',
  music: '🎵 Music',
  stories: '📖 Stories',
  aac: '🗣️ AAC Communication',
  breathing: '🌬️ Breathing',
  schedule: '📅 Daily Schedule',
  social: '👥 Social Skills',
  motor: '🏃 Motor Skills',
  speech: '💬 Speech Practice',
  art: '🖌️ Art',
  nature: '🌿 Nature',
};

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  diagnoses: DiagnosisType[];
  allowedTags: ContentTag[];
  embedding: number[];
  enrolledAt: number;
  stars: number;
  badges: string[];
  photoUrl?: string;
  faceConsent?: boolean;
  generalConsent?: boolean;
}

export type LanguageCode = 'en-US' | 'ar-SA' | 'ur-PK' | 'hi-IN' | 'es-ES' | 'fr-FR';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export interface AppSettings {
  language: LanguageCode;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  languageSelected: boolean;
  /** AAC additions */
  hapticsEnabled: boolean;
  speechRate: number;      // 0.5 (slow) .. 1.0 (normal)
  boardColumns: number;    // 2 .. 5 tiles per row
  kioskMode: boolean;      // best-effort in-app lock
}

export type AppScreen =
  | 'landing'
  | 'face-scan'
  | 'home'
  | 'speak'
  | 'schedule'
  | 'games'
  | 'progress'
  | 'more'
  | 'parent-setup'
  | 'enroll-child'
  | 'parent-hub'
  | 'rewards'
  | 'calm-down'
  | 'accessibility'
  | 'doctor-panel'
  | 'category-builder'
  | 'my-categories'
  | 'sentence-picture';

export type TabScreen = 'home' | 'speak' | 'schedule' | 'games' | 'progress';

export interface ContentItem {
  id: string;
  title: string;
  emoji: string;
  tag: ContentTag;
  minAge: number;
  maxAge: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Additive feature modules (Category Builder + Sentence Picture).
// Entirely separate from the existing AAC board; only consumed by the new
// screens/modules. Nothing here touches existing data structures.
// ---------------------------------------------------------------------------

export type TileSize = 'sm' | 'md' | 'lg';

export interface CustomWord {
  id: string;
  label: string;
  phrase: string;
  emoji: string;
  imageUri?: string;
  /** Recorded voice clip (local file). When present and useTextToSpeech is not true, it is played instead of TTS. */
  audioUri?: string;
  useTextToSpeech?: boolean;
  size?: TileSize;
  order: number;
}

export interface CustomCategory {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: 'voice' | 'list' | 'generated' | 'manual' | 'seed';
  grouping: 'none' | 'alpha-range';
  /** Folder colour + icon shown on the board. */
  color?: string;
  icon?: string;
  /** null / undefined = a top-level folder. Set = a sub-folder of that category. */
  parentCategoryId?: string | null;
  order?: number;
  words: CustomWord[];
}

export interface ParsedCategoryCommand {
  categoryName: string;
  requestedCount: number | null;
  explicitItems: string[];
  matchedSeed: string | null;
}

export interface SentenceScene {
  raw: string;
  adjectives: string[];
  color: string | null;
  subject: string | null;
  preposition: string | null;
  reference: string | null;
  conceptKey: string | null;
}
