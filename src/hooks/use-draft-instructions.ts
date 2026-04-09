"use client";

import { useState, useEffect, useCallback } from "react";
import type { DraftInstructions } from "@/types";

const STORAGE_KEY = "morning-brew-draft-instructions";

const DEFAULTS: DraftInstructions = {
  tweet: "",
  linkedin: "",
};

export function useDraftInstructions() {
  const [instructions, setInstructionsState] = useState<DraftInstructions>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setInstructionsState({ ...DEFAULTS, ...JSON.parse(stored) });
      }
    } catch {}
    setLoaded(true);
  }, []);

  const setInstructions = useCallback((updates: Partial<DraftInstructions>) => {
    setInstructionsState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { instructions, setInstructions, loaded };
}
