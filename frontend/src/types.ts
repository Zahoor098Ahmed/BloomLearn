export type LanguageCode = 'en-US' | 'ar-SA';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export interface AppSettings {
  language: LanguageCode;
  /** Read-aloud on/off. */
  soundEnabled: boolean;
  /** Read the sentence aloud by itself after speaking it. */
  autoSpeak: boolean;
  /** Read-aloud speed: 0.6 (slow) .. 1.1 (fast). */
  speechRate: number;
  /** The welcome screen has been completed. */
  onboarded: boolean;
  /** Privacy: keep the list of recent sentences on this device. */
  saveHistory: boolean;
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

/** Rich scene graph for the Hybrid Smart Sentence-to-Scene engine. */
export type SceneSize = 'tiny' | 'small' | 'normal' | 'big' | 'huge';

export interface SceneEntity {
  type: string;        // e.g. "cat"
  glyph: string;       // emoji stand-in
  color: string | null;
  colorHex: string | null;
  size: SceneSize;
  count: number;       // 1..5 rendered
  action: string | null;
}

export interface SceneGraph {
  raw: string;
  subject: SceneEntity | null;
  relation: string | null;   // canonical: under | on | above | behind | in front of | beside | inside | null
  reference: SceneEntity | null;
  conceptKey: string | null;
  /** 0..1 — how well the on-device engine understood the sentence. */
  confidence: number;
}
