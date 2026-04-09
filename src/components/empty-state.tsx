"use client";

interface EmptyStateProps {
  hasKeys: boolean;
  onOpenSettings: () => void;
}

export function EmptyState({ hasKeys, onOpenSettings }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--accent-surface)" }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>

      {!hasKeys ? (
        <>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome to Daily Brew
          </h2>
          <p className="text-sm text-center max-w-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Your daily cup of news, handpicked by AI.
            Add your API keys to get started.
          </p>
          <button
            onClick={onOpenSettings}
            className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ background: "var(--accent)" }}
          >
            Add API Keys
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Your brew is empty
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: "var(--text-muted)" }}>
            Add a topic above to start filling your morning brew.
          </p>
        </>
      )}
    </div>
  );
}
