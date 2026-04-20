"use client";

import { useState } from "react";
import type { YutoriScout } from "@/types";
import { ScoutForm } from "./scout-form";
import { formatRelativeFuture, formatRelativePast } from "@/lib/time-format";

interface ScoutManagerProps {
  scouts: YutoriScout[];
  onCreateScout: (query: string) => Promise<void>;
  onTogglePause: (scoutId: string, currentStatus: string) => Promise<void>;
  onDeleteScout: (scoutId: string) => Promise<void>;
  onPauseAll: () => Promise<void>;
  onResumeAll: () => Promise<void>;
  disabled: boolean;
}

export function ScoutManager({
  scouts,
  onCreateScout,
  onTogglePause,
  onDeleteScout,
  onPauseAll,
  onResumeAll,
  disabled,
}: ScoutManagerProps) {
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const allPaused = scouts.length > 0 && scouts.every((s) => s.status === "paused");
  const hasActive = scouts.some((s) => s.status === "active");

  const handlePauseAll = async () => {
    setBulkLoading(true);
    setBulkMessage("");
    await onPauseAll();
    setBulkLoading(false);
    setBulkMessage("All topics paused. They won't run until you resume.");
    setTimeout(() => setBulkMessage(""), 4000);
  };

  const handleResumeAll = async () => {
    setBulkLoading(true);
    setBulkMessage("");
    await onResumeAll();
    setBulkLoading(false);
    setBulkMessage("All topics resumed. Your next brew will be ready tomorrow.");
    setTimeout(() => setBulkMessage(""), 4000);
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            What would you like to read with your morning coffee?
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Add topics or websites you want to follow. Tomorrow morning, your brew will be ready.
          </p>
        </div>
        {scouts.length > 1 && (
          <button
            onClick={allPaused ? handleResumeAll : handlePauseAll}
            disabled={bulkLoading || (!allPaused && !hasActive)}
            className="text-xs px-2.5 py-1 rounded-md transition-colors disabled:opacity-40 shrink-0"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-primary)",
            }}
            title={allPaused ? "Resume all topics" : "Skip a day to save API costs"}
          >
            {bulkLoading ? "..." : allPaused ? "Resume all" : "Pause all"}
          </button>
        )}
      </div>

      {bulkMessage && (
        <p className="text-xs mb-3 animate-fade-in" style={{ color: "var(--accent)" }}>
          ✓ {bulkMessage}
        </p>
      )}

      {/* Scout list */}
      {scouts.length > 0 && (
        <div className="space-y-2 mb-3">
          {scouts.map((scout) => {
            const nextRun = scout.status === "active" ? formatRelativeFuture(scout.next_output_timestamp) : null;
            const lastRun = formatRelativePast(scout.last_update_timestamp);
            const scheduleBits: string[] = [];
            if (scout.status === "paused") scheduleBits.push("Paused");
            else if (scout.status === "done") scheduleBits.push("Deactivated");
            else scheduleBits.push("Active");
            scheduleBits.push("Daily");
            if (nextRun) scheduleBits.push(`next ${nextRun}`);
            else if (scout.status === "active" && !lastRun) scheduleBits.push("waiting for first run");
            if (lastRun) scheduleBits.push(`last ran ${lastRun}`);

            return (
            <div
              key={scout.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div className="flex-1 min-w-0 mr-3">
                <p
                  className="text-sm truncate"
                  style={{
                    color: scout.status === "paused" ? "var(--text-muted)" : "var(--text-primary)",
                  }}
                >
                  {scout.query}
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {scheduleBits.join(" · ")}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Pause/Resume */}
                <button
                  onClick={() => onTogglePause(scout.id, scout.status)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  title={scout.status === "paused" ? "Resume" : "Pause"}
                >
                  {scout.status === "paused" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteScout(scout.id)}
                  className="p-1.5 rounded-md transition-colors hover:text-red-400"
                  style={{ color: "var(--text-faint)" }}
                  title="Delete scout"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Add new scout */}
      <ScoutForm onSubmit={onCreateScout} disabled={disabled} />

      {/* Yutori cost note */}
      <p className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>
        Each topic runs once a day on Yutori (~$0.35 per run, billed to your Yutori account).
      </p>
    </div>
  );
}
