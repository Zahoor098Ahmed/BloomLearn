import * as Speech from "expo-speech";
import type { LanguageCode } from "../types";

export function speak(text: string, lang: LanguageCode, enabled: boolean): void {
  if (!enabled) return;
  Speech.stop();
  Speech.speak(text, { language: lang, rate: 0.85, pitch: 1.1 });
}

export function stopSpeech(): void {
  Speech.stop();
}
