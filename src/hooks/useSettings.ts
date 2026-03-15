import { useState, useCallback } from "react";

const SETTINGS_KEY = "hc-tapcalc-settings";

export type RefreshInterval = 1 | 5 | 15 | 30 | 60 | 180 | 360 | 720 | 1440;

export const REFRESH_INTERVAL_OPTIONS: { value: RefreshInterval; label: string }[] = [
  { value: 1, label: "1 min" },
  { value: 5, label: "5 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 180, label: "3 hours" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "24 hours" },
];

interface AppSettings {
  currencyRefreshInterval: RefreshInterval;
}

const DEFAULT_SETTINGS: AppSettings = {
  currencyRefreshInterval: 60,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

function persistSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const setSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persistSettings(next);
      return next;
    });
  }, []);

  return { settings, setSetting };
}
