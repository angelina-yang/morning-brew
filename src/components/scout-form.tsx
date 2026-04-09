"use client";

import { useState } from "react";

interface ScoutFormProps {
  onSubmit: (query: string) => Promise<void>;
  disabled: boolean;
}

export function ScoutForm({ onSubmit, disabled }: ScoutFormProps) {
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || submitting || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(query.trim());
      setQuery("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="e.g., AI startup funding, posts from Andrew Ng, tech news from Japan..."
        disabled={disabled || submitting}
        className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 disabled:opacity-50"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-primary)",
          color: "var(--text-primary)",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!query.trim() || submitting || disabled}
        className="px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
        style={{ background: "var(--accent)" }}
      >
        {submitting ? "Adding..." : "Add to brew"}
      </button>
    </div>
  );
}
