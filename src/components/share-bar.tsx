"use client";

import { useState } from "react";
import type { DigestItem } from "@/types";

interface ShareBarProps {
  selectedItems: DigestItem[];
  onDeselectAll: () => void;
}

export function ShareBar({ selectedItems, onDeselectAll }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleCopy = async () => {
    const formatted = selectedItems
      .map(
        (item, i) =>
          `${i + 1}. ${item.title}\n${item.summary}${item.sourceUrl ? `\n${item.sourceUrl}` : ""}`
      )
      .join("\n\n");

    const text = `Daily Brew\n${"=".repeat(20)}\n\n${formatted}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleListen = () => {
    const urls = selectedItems
      .map((i) => i.sourceUrl)
      .filter((u): u is string => Boolean(u))
      .map((u) => encodeURIComponent(u))
      .join(",");
    if (!urls) return;
    window.open(`https://tllisten.twosetai.com?urls=${urls}`, "_blank", "noopener,noreferrer");
  };

  const hasUrls = selectedItems.some((i) => i.sourceUrl);

  return (
    <div
      className="sticky bottom-0 z-40 px-4 py-3 flex items-center justify-between"
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border-primary)",
      }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDeselectAll}
          className="px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--border-primary)",
          }}
        >
          Deselect
        </button>
        <button
          onClick={handleListen}
          disabled={!hasUrls}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-40"
          style={{
            color: "var(--text-secondary)",
            border: "1px solid var(--border-primary)",
          }}
          title="Open selected articles in TL;Listen for audio playback"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          Listen on TL;Listen
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-1.5 rounded-lg text-white text-xs font-medium transition-colors"
          style={{ background: "var(--accent)" }}
        >
          {copied ? "Copied!" : "Copy to Share"}
        </button>
      </div>
    </div>
  );
}
