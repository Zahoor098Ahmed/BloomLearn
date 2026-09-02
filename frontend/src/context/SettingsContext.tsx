import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AppSettings } from "../types";
import { loadSettings, saveSettings, hydrateStorage, isHydrated } from "../modules/storage";

interface SettingsContextType {
  settings: AppSettings;
  ready: boolean;
  update: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(isHydrated());
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    if (ready) return;
    hydrateStorage().then(() => {
      setSettings(loadSettings());
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

  return <SettingsContext.Provider value={{ settings, ready, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
