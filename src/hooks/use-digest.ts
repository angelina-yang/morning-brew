"use client";

import { useState, useCallback } from "react";
import type { DigestItem, Digest, ApiKeys, YutoriScout } from "@/types";

const STORAGE_KEY = "morning-brew-digest";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function loadCachedDigest(): Digest | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveCachedDigest(digest: Digest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(digest));
  } catch {}
}

export function isDigestFresh(digest: Digest | null): boolean {
  if (!digest?.generatedAt) return false;
  const age = Date.now() - new Date(digest.generatedAt).getTime();
  return age < CACHE_TTL_MS;
}

export function useDigest(keys: ApiKeys) {
  const [digest, setDigest] = useState<Digest | null>(loadCachedDigest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateDigest = useCallback(
    async (scouts: YutoriScout[]) => {
      if (!keys.yutoriApiKey || !keys.claudeApiKey) return;
      if (scouts.length === 0) return;

      setLoading(true);
      setError("");

      try {
        // Fetch updates from all active scouts
        const activeScouts = scouts.filter((s) => s.status === "active");
        const allUpdates: { scout_query: string; content: string; sources: { url: string; title: string }[]; created_at: string }[] = [];

        await Promise.all(
          activeScouts.map(async (scout) => {
            try {
              const res = await fetch(`/api/scouts/${scout.id}/updates?limit=10`, {
                headers: { "x-yutori-api-key": keys.yutoriApiKey },
              });
              if (res.ok) {
                const data = await res.json();
                const updates = data.updates || [];
                for (const u of updates) {
                  allUpdates.push({
                    scout_query: scout.query,
                    content: u.content,
                    sources: u.sources || [],
                    created_at: u.created_at,
                  });
                }
              }
            } catch {
              // Skip failed scouts, continue with others
            }
          })
        );

        if (allUpdates.length === 0) {
          setDigest({
            items: [],
            generatedAt: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        // Send to Claude for digest generation
        const res = await fetch("/api/digest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-claude-api-key": keys.claudeApiKey,
          },
          body: JSON.stringify({
            updates: allUpdates,
            language: keys.outputLanguage,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate digest");

        const items: DigestItem[] = (data.items || []).map(
          (item: Record<string, string>, i: number) => ({
            id: `digest-${Date.now()}-${i}`,
            title: item.title || "Untitled",
            summary: item.summary || "",
            sourceUrl: item.sourceUrl || "",
            sourceName: item.sourceName || "",
            scoutQuery: item.scoutQuery || "",
            timestamp: item.timestamp || new Date().toISOString(),
            selected: false,
          })
        );

        const newDigest: Digest = {
          items,
          generatedAt: data.generatedAt || new Date().toISOString(),
        };

        setDigest(newDigest);
        saveCachedDigest(newDigest);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate digest");
      }

      setLoading(false);
    },
    [keys]
  );

  const toggleSelect = useCallback((id: string) => {
    setDigest((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        ),
      };
      return updated;
    });
  }, []);

  const deselectAll = useCallback(() => {
    setDigest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({ ...item, selected: false })),
      };
    });
  }, []);

  const selectedItems = digest?.items.filter((i) => i.selected) || [];

  return {
    digest,
    loading,
    error,
    generateDigest,
    toggleSelect,
    deselectAll,
    selectedItems,
  };
}
