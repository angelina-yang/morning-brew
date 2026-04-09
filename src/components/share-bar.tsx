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
