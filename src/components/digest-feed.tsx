"use client";

import type { DigestItem, Platform } from "@/types";
import { DigestCard } from "./digest-card";

interface DigestFeedProps {
  items: DigestItem[];
  generatedAt: string;
  onToggleSelect: (id: string) => void;
  onDraft: (item: DigestItem, platform: Platform) => void;
}

export function DigestFeed({ items, generatedAt, onToggleSelect, onDraft }: DigestFeedProps) {
  const date = new Date(generatedAt);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Digest header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
          Today&apos;s Digest
          <span className="font-normal text-sm ml-2" style={{ color: "var(--text-muted)" }}>
            {items.length} items
          </span>
        </h2>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          Last updated {timeStr}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {items.map((item) => (
          <DigestCard
            key={item.id}
            item={item}
            onToggleSelect={onToggleSelect}
            onDraft={onDraft}
          />
        ))}
      </div>
    </div>
  );
}
