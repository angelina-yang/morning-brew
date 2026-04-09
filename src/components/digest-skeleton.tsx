"use client";

export function DigestSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full animate-pulse-dot-1" style={{ background: "var(--accent)" }} />
          <div className="w-2 h-2 rounded-full animate-pulse-dot-2" style={{ background: "var(--accent)" }} />
          <div className="w-2 h-2 rounded-full animate-pulse-dot-3" style={{ background: "var(--accent)" }} />
        </div>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Brewing your digest...
        </span>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl p-4 animate-pulse"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <div className="h-4 rounded w-3/4 mb-3" style={{ background: "var(--bg-hover)" }} />
          <div className="h-3 rounded w-full mb-2" style={{ background: "var(--bg-hover)" }} />
          <div className="h-3 rounded w-5/6" style={{ background: "var(--bg-hover)" }} />
        </div>
      ))}
    </div>
  );
}
