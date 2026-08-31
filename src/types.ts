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
  | 'doctor-panel';

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
