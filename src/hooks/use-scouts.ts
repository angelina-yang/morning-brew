"use client";

import { useState, useCallback } from "react";
import type { YutoriScout, ApiKeys } from "@/types";

export function useScouts(keys: ApiKeys) {
  const [scouts, setScouts] = useState<YutoriScout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = useCallback((): Record<string, string> => ({
    "Content-Type": "application/json",
    "x-yutori-api-key": keys.yutoriApiKey,
  }), [keys.yutoriApiKey]);

  const fetchScouts = useCallback(async () => {
    if (!keys.yutoriApiKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scouts", { headers: headers() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch scouts");
      setScouts(data.scouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scouts");
    }
    setLoading(false);
  }, [keys.yutoriApiKey, headers]);

  const createScout = useCallback(async (query: string) => {
    setError("");
    try {
      const res = await fetch("/api/scouts", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create scout");
      setScouts((prev) => [...prev, data.scout]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create scout");
      throw err;
    }
  }, [headers]);

  const togglePause = useCallback(async (scoutId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paused" ? "active" : "paused";
    setError("");
    try {
      const res = await fetch(`/api/scouts/${scoutId}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update scout");
      setScouts((prev) =>
        prev.map((s) => (s.id === scoutId ? { ...s, status: newStatus as "active" | "paused" } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update scout");
    }
  }, [headers]);

  const deleteScout = useCallback(async (scoutId: string) => {
    setError("");
    try {
      const res = await fetch(`/api/scouts/${scoutId}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete scout");
      }
      setScouts((prev) => prev.filter((s) => s.id !== scoutId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete scout");
    }
  }, [headers]);

  const pauseAll = useCallback(async () => {
    setError("");
    const activeScouts = scouts.filter((s) => s.status === "active");
    if (activeScouts.length === 0) return;
    try {
      await Promise.all(
        activeScouts.map((s) =>
          fetch(`/api/scouts/${s.id}`, {
            method: "PATCH",
            headers: headers(),
            body: JSON.stringify({ status: "paused" }),
          })
        )
      );
      setScouts((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "paused" as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause all scouts");
    }
  }, [scouts, headers]);

  const resumeAll = useCallback(async () => {
    setError("");
    const pausedScouts = scouts.filter((s) => s.status === "paused");
    if (pausedScouts.length === 0) return;
    try {
      await Promise.all(
        pausedScouts.map((s) =>
          fetch(`/api/scouts/${s.id}`, {
            method: "PATCH",
            headers: headers(),
            body: JSON.stringify({ status: "active" }),
          })
        )
      );
      setScouts((prev) =>
        prev.map((s) => (s.status === "paused" ? { ...s, status: "active" as const } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume all scouts");
    }
  }, [scouts, headers]);

  return {
    scouts,
    loading,
    error,
    fetchScouts,
    createScout,
    togglePause,
    deleteScout,
    pauseAll,
    resumeAll,
  };
}
