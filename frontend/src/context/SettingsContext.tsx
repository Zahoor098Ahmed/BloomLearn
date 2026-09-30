import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AppSettings } from "../types";
import { loadSettings, saveSettings, hydrateStorage, isHydrated, defaultSettings } from "../modules/storage";
import { loadApiKeys } from "../modules/apiKeys";
import { applyLanguageDirection } from "../modules/i18n";

interface SettingsContextType {
  settings: AppSettings;
  ready: boolean;
  update: (patch: Partial<AppSettings>) => void;
  /** Back to the default settings (keeps onboarding done). */
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(isHydrated());
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    if (ready) return;
    Promise.all([hydrateStorage(), loadApiKeys()]).then(() => {
      const s = loadSettings();
      // sets RTL for the *next* app start if it differs from the current one
      try {
        applyLanguageDirection(s.language);
      } catch {
        /* ignore */
      }
      setSettings(s);
      setReady(true);
    });
  }, []);

  function update(patch: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  function reset() {
    const next = { ...defaultSettings(), onboarded: true };
    saveSettings(next);
    setSettings(next);
  }

  return <SettingsContext.Provider value={{ settings, ready, update, reset }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
