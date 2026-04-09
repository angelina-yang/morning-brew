"use client";

import type { YutoriScout } from "@/types";
import { ScoutForm } from "./scout-form";

interface ScoutManagerProps {
  scouts: YutoriScout[];
  onCreateScout: (query: string) => Promise<void>;
  onTogglePause: (scoutId: string, currentStatus: string) => Promise<void>;
  onDeleteScout: (scoutId: string) => Promise<void>;
  disabled: boolean;
}

export function ScoutManager({
  scouts,
  onCreateScout,
  onTogglePause,
  onDeleteScout,
  disabled,
}: ScoutManagerProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          What would you like to read with your morning coffee?
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Add topics or websites you want to follow. Tomorrow morning, your brew will be ready.
        </p>
      </div>

      {/* Scout list */}
      {scouts.length > 0 && (
        <div className="space-y-2 mb-3">
          {scouts.map((scout) => (
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
                  {scout.status === "paused" ? "Paused" : "Active"} &middot; Daily
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
          ))}
        </div>
      )}

      {/* Add new scout */}
      <ScoutForm onSubmit={onCreateScout} disabled={disabled} />
    </div>
  );
}
