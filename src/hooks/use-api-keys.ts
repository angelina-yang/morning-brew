"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiKeys, OutputLanguage } from "@/types";

export type { OutputLanguage };

export const LANGUAGES: { code: OutputLanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
];

const STORAGE_KEY = "morning-brew-api-keys";

const DEFAULTS: ApiKeys = {
  yutoriApiKey: "",
  claudeApiKey: "",
  outputLanguage: "en",
  keysValidated: false,
};

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  const saveKeys = useCallback((newKeys: ApiKeys) => {
    setKeys(newKeys);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearKeys = useCallback(() => {
    setKeys(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasKeys = Boolean(keys.yutoriApiKey && keys.claudeApiKey) && keys.keysValidated;

  return { keys, hasKeys, loaded, saveKeys, clearKeys };
}
