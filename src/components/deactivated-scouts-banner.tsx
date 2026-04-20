"use client";

import { useState } from "react";
import type { YutoriScout } from "@/types";

interface DeactivatedScoutsBannerProps {
  scouts: YutoriScout[];
  onRecreate: (query: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function reasonCopy(reason: string | null | undefined): string {
  if (!reason) return "Yutori deactivated this scout.";
  if (reason === "insufficient_prepaid_balance") return "Insufficient prepaid balance.";
  // fallback — humanize the snake_case code
  return reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + ".";
}

export function DeactivatedScoutsBanner({
  scouts,
  onRecreate,
  onDelete,
}: DeactivatedScoutsBannerProps) {
  const done = scouts.filter((s) => s.status === "done");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (done.length === 0) return null;

  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{
        background: "var(--accent-surface)",
        border: "1px solid var(--accent)",
      }}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none mt-0.5">☕</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            {done.length === 1 ? "A scout was deactivated by Yutori" : `${done.length} scouts were deactivated by Yutori`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Deactivated scouts stop running and won&rsquo;t appear in your brew.{" "}
            <a
              href="https://platform.yutori.com/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              Add credits on Yutori →
            </a>
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 pl-7">
        {done.map((s) => {
          const isBusy = busyId === s.id;
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded-md"
              style={{ background: "var(--bg-input)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ color: "var(--text-primary)" }}>
                  {s.query}
                </p>
                <p className="mt-0.5" style={{ color: "var(--text-faint)" }}>
                  {reasonCopy(s.rejection_reason)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={async () => {
                    setBusyId(s.id);
                    try {
                      await onRecreate(s.query);
                      // After re-creating, remove the done one so the banner clears
                      await onDelete(s.id);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={isBusy}
                  className="text-xs px-2 py-1 rounded-md transition-colors disabled:opacity-40"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                  }}
                  title="Create a fresh scout with the same query"
                >
                  {isBusy ? "..." : "Re-create"}
                </button>
                <button
                  onClick={async () => {
                    setBusyId(s.id);
                    try {
                      await onDelete(s.id);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={isBusy}
                  className="text-xs px-1.5 py-1 rounded-md transition-colors disabled:opacity-40"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Dismiss this deactivated scout"
                  title="Remove from list"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
