import {
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  AudioModule,
  RecordingPresets,
  type AudioStatus,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";
import type { LanguageCode } from "../types";

/**
 * Voice recording + playback for communication words.
 *
 * - A word may have its own recorded clip (familiar voice) or fall back to TTS.
 * - The sentence bar plays each word in order, chaining clips and TTS.
 * - Clips are stored under the app's document directory so they survive and
 *   ship in a backup.
 */

const CLIP_DIR = `${FileSystem.documentDirectory}voice/`;

async function ensureDir() {
  try {
    const info = await FileSystem.getInfoAsync(CLIP_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(CLIP_DIR, { intermediates: true });
  } catch {
    /* ignore */
  }
}

// --- recording -----------------------------------------------------------

// AudioModule is a native module (loosely typed); the recorder is its class instance.
let recorder: { prepareToRecordAsync: () => Promise<void>; record: () => void; stop: () => Promise<void>; uri: string | null } | null =
  null;

export async function canRecord(): Promise<boolean> {
  try {
    const res = await requestRecordingPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

export async function startRecording(): Promise<boolean> {
  if (!(await canRecord())) return false;
  try {
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    const Ctor = (AudioModule as { AudioRecorder: new (o: unknown) => NonNullable<typeof recorder> }).AudioRecorder;
    const rec = new Ctor(RecordingPresets.HIGH_QUALITY);
    await rec.prepareToRecordAsync();
    rec.record();
    recorder = rec;
    return true;
  } catch {
    recorder = null;
    return false;
  }
}

/** Stop recording and move the clip into permanent storage. Returns its uri. */
export async function stopRecording(wordId: string): Promise<string | null> {
  const rec = recorder;
  if (!rec) return null;
  try {
    await rec.stop();
    const tmp = rec.uri;
    recorder = null;
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (!tmp) return null;
    await ensureDir();
    const dest = `${CLIP_DIR}${wordId}.m4a`;
    try {
      await FileSystem.deleteAsync(dest, { idempotent: true });
    } catch {
      /* ignore */
    }
    await FileSystem.moveAsync({ from: tmp, to: dest });
    return dest;
  } catch {
    recorder = null;
    return null;
  }
}

export async function deleteClip(uri?: string) {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    /* ignore */
  }
}

// --- playback ------------------------------------------------------------

function playClip(uri: string): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        player.remove();
      } catch {
        /* ignore */
      }
      resolve();
    };
    const player = createAudioPlayer(uri);
    const sub = player.addListener("playbackStatusUpdate", (s: AudioStatus) => {
      if (s.didJustFinish) {
        sub?.remove?.();
        finish();
      }
    });
    try {
      player.play();
    } catch {
      finish();
    }
    // safety timeout so a broken clip never hangs the sentence
    setTimeout(finish, 6000);
  });
}

function speakWord(text: string, lang: LanguageCode, rate: number): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, {
      language: lang,
      rate,
      pitch: 1.05,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export interface SpokenWord {
  label: string;
  audioUri?: string;
  useTextToSpeech?: boolean;
}

/** Play one word: its clip if present and allowed, otherwise TTS. */
export async function playWord(word: SpokenWord, lang: LanguageCode, rate = 0.9): Promise<void> {
  if (word.audioUri && word.useTextToSpeech !== true) {
    await playClip(word.audioUri);
  } else {
    await speakWord(word.label, lang, rate);
  }
}

/** Play a whole sentence, word by word, in order. */
export async function playSentence(words: SpokenWord[], lang: LanguageCode, rate = 0.9): Promise<void> {
  Speech.stop();
  for (const w of words) {
    await playWord(w, lang, rate);
    await new Promise((r) => setTimeout(r, 120));
  }
}

export function previewClip(uri: string): Promise<void> {
  return playClip(uri);
}
