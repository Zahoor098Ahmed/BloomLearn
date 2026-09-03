import { Platform } from "react-native";

/**
 * Free live voice input for the Hybrid engine — no API key, no cost.
 *
 *  - Web (Chrome / Edge): the browser Web Speech API. Real-time, works now.
 *  - Native (Expo Go / current builds): not available here — the caller falls
 *    back to record→Whisper (needs a key) or the keyboard microphone.
 *    On-device native STT can be added later with a maintained library + a
 *    dev build.
 *
 * Partial results stream in so the picture builds up word by word.
 */

export interface VoiceHandlers {
  lang?: string; // BCP-47, e.g. "en-US", "ar-SA"
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

// Minimal Web Speech API shape (RN tsconfig has no DOM lib).
interface WSResult { readonly isFinal: boolean; readonly length: number; [i: number]: { transcript: string } }
interface WSEvent { resultIndex: number; results: { length: number; [i: number]: WSResult } }
interface WSRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: WSEvent) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function webRecognition(): (new () => WSRecognition) | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => WSRecognition;
    webkitSpeechRecognition?: new () => WSRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** true when live voice input can run in this environment (web browsers). */
export function voiceAvailable(): boolean {
  return !!webRecognition();
}

let webInstance: WSRecognition | null = null;
let listening = false;

export function isListening() {
  return listening;
}

export async function startListening(h: VoiceHandlers): Promise<boolean> {
  const lang = h.lang || "en-US";

  // --- web ---
  const Rec = webRecognition();
  if (Rec) {
    try {
      webInstance = new Rec();
      webInstance.lang = lang;
      webInstance.continuous = true;
      webInstance.interimResults = true;
      webInstance.onresult = (e: WSEvent) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (interim) h.onPartial?.(interim.trim());
        if (final) h.onFinal?.(final.trim());
      };
      webInstance.onerror = (e: unknown) => h.onError?.(String((e as { error?: string })?.error ?? "voice error"));
      webInstance.onend = () => {
        listening = false;
        h.onEnd?.();
      };
      webInstance.start();
      listening = true;
      return true;
    } catch {
      webInstance = null;
      return false;
    }
  }

  void lang;
  return false;
}

export async function stopListening(): Promise<void> {
  listening = false;
  try {
    if (webInstance) {
      webInstance.stop();
      webInstance = null;
    }
  } catch {
    /* ignore */
  }
}
