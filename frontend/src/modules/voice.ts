import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { startRecording, stopRecordingTemp } from "./audio";
import { transcribeAudio } from "./aiImage";

/**
 * Universal voice input module:
 *
 * - Web (Chrome / Edge): Real-time Web Speech API with streaming partials.
 * - Installed app (APK / dev build): the phone's own speech recogniser via
 *   expo-speech-recognition — the same Google engine Chrome uses, live words
 *   as you speak, free, and no server needed.
 * - Expo Go (which can't load that native module): record with expo-audio,
 *   then Whisper on the BloomLearn server turns the clip into text.
 *
 * Provides a unified startListening / stopListening interface across platforms.
 */

// expo-speech-recognition's native module, loaded optionally: importing the
// package itself would crash Expo Go, which doesn't ship it.
interface NativeSpeech {
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  isRecognitionAvailable(): boolean;
  start(options: { lang: string; interimResults: boolean; continuous: boolean; addsPunctuation?: boolean }): void;
  stop(): void;
  addListener(event: "result", fn: (e: { isFinal: boolean; results: { transcript: string }[] }) => void): { remove(): void };
  addListener(event: "error", fn: (e: { error: string; message: string }) => void): { remove(): void };
  addListener(event: "end", fn: () => void): { remove(): void };
}
const NativeSpeechModule = Platform.OS === "web" ? null : requireOptionalNativeModule<NativeSpeech>("ExpoSpeechRecognition");

/** true in an installed app whose phone has a speech recogniser (not in Expo Go). */
export function nativeSpeechAvailable(): boolean {
  try {
    return !!NativeSpeechModule?.isRecognitionAvailable();
  } catch {
    return false;
  }
}

export interface VoiceHandlers {
  lang?: string; // BCP-47, e.g. "en-US", "ar-SA", "ur-PK"
  onPartial?: (text: string) => void;
  /** Native only: recording, then turning the recording into text. */
  onStatus?: (status: "listening" | "processing") => void;
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

/** true when voice input can run in this environment (web or native recording). */
export function voiceAvailable(): boolean {
  if (Platform.OS === "web") {
    return !!webRecognition();
  }
  // Native recording via expo-audio is available on mobile devices
  return true;
}

let webInstance: WSRecognition | null = null;
let listening = false;
let nativeRecording = false;
let nativeSubs: { remove(): void }[] = [];
let activeHandlers: VoiceHandlers | null = null;

export function isListening() {
  return listening;
}

export async function startListening(h: VoiceHandlers): Promise<boolean> {
  const lang = h.lang || "en-US";
  activeHandlers = h;

  // 1. Web Speech Recognition (Chrome/Edge/Web)
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
      webInstance.onerror = (e: unknown) => {
        h.onError?.(String((e as { error?: string })?.error ?? "voice error"));
      };
      webInstance.onend = () => {
        listening = false;
        h.onEnd?.();
      };
      webInstance.start();
      listening = true;
      return true;
    } catch {
      webInstance = null;
    }
  }

  // 2. The phone's own speech recogniser (installed app): live, like Chrome
  if (NativeSpeechModule && nativeSpeechAvailable()) {
    try {
      const perm = await NativeSpeechModule.requestPermissionsAsync();
      if (perm.granted) {
        const finish = () => {
          nativeSubs.forEach((s) => s.remove());
          nativeSubs = [];
          listening = false;
          activeHandlers = null;
          h.onEnd?.();
        };
        nativeSubs = [
          NativeSpeechModule.addListener("result", (e) => {
            const text = (e.results[0]?.transcript ?? "").trim();
            if (!text) return;
            if (e.isFinal) h.onFinal?.(text);
            else h.onPartial?.(text);
          }),
          NativeSpeechModule.addListener("error", (e) => {
            if (e.error === "aborted") return;
            h.onError?.(e.error === "no-speech" ? "I didn't hear anything. Please try again." : e.message || e.error);
          }),
          NativeSpeechModule.addListener("end", finish),
        ];
        NativeSpeechModule.start({ lang, interimResults: true, continuous: true, addsPunctuation: false });
        listening = true;
        return true;
      }
    } catch (err) {
      console.warn("[voice] native speech recognition failed, falling back to recording:", err);
      nativeSubs.forEach((s) => s.remove());
      nativeSubs = [];
    }
  }

  // 3. Native Mobile Audio Recording (Expo Audio -> Whisper STT), e.g. in Expo Go
  try {
    const ok = await startRecording();
    if (ok) {
      nativeRecording = true;
      listening = true;
      h.onStatus?.("listening");
      return true;
    }
  } catch (err: any) {
    console.warn("[voice] native recording error:", err);
  }

  activeHandlers = null;
  listening = false;
  return false;
}

export async function stopListening(): Promise<void> {
  // the phone's recogniser: stop() delivers the last result, then its "end"
  // event runs the cleanup and onEnd
  if (nativeSubs.length && NativeSpeechModule) {
    try {
      NativeSpeechModule.stop();
    } catch {
      /* ignore */
    }
    return;
  }

  listening = false;
  const handlers = activeHandlers;
  activeHandlers = null;

  // Stop web recognition
  if (webInstance) {
    try {
      webInstance.stop();
      webInstance = null;
    } catch {
      /* ignore */
    }
  }

  // Stop native recording and transcribe
  if (nativeRecording) {
    nativeRecording = false;
    try {
      const uri = await stopRecordingTemp();
      // never fail silently: a missing recording used to just end with nothing
      if (!uri) handlers?.onError?.("The recording didn't work. Please try again, or type the sentence.");
      if (uri && handlers) {
        handlers.onStatus?.("processing");
        const langHint = (handlers.lang || "en").split("-")[0];
        const res = await transcribeAudio(uri, langHint);
        if (res.text) {
          handlers.onFinal?.(res.text.trim());
        } else if (res.error) {
          handlers.onError?.(res.error);
        } else {
          handlers.onError?.("No speech detected. Please try again.");
        }
      }
    } catch (err: any) {
      handlers?.onError?.(err?.message || "Failed to process audio.");
    } finally {
      handlers?.onEnd?.();
    }
  }
}
