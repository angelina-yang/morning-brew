"use client";

import type { DigestItem, Platform } from "@/types";

interface DigestCardProps {
  item: DigestItem;
  onToggleSelect: (id: string) => void;
  onDraft: (item: DigestItem, platform: Platform) => void;
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function DigestCard({ item, onToggleSelect, onDraft }: DigestCardProps) {
  return (
    <div
      className="rounded-xl p-4 transition-colors animate-fade-in"
      style={{
        background: item.selected ? "var(--bg-active)" : "var(--bg-card)",
        border: `1px solid ${item.selected ? "var(--accent)" : "var(--border-primary)"}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelect(item.id)}
          className="mt-1 shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="text-sm font-semibold mb-1 leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title}
          </h3>

          {/* Summary */}
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {item.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Source */}
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {item.sourceName || new URL(item.sourceUrl).hostname}
                </a>
              )}

              {/* Scout badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--accent-surface)",
                  color: "var(--accent-text)",
                }}
              >
                {item.scoutQuery}
              </span>

              {/* Timestamp */}
              {item.timestamp && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-faint)" }}
                  title={new Date(item.timestamp).toLocaleString()}
                >
                  {formatTimestamp(item.timestamp)}
                </span>
              )}
            </div>

            {/* Draft buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDraft(item, "tweet")}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "var(--text-muted)" }}
                title="Draft tweet"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() => onDraft(item, "linkedin")}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "var(--text-muted)" }}
                title="Draft LinkedIn post"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
