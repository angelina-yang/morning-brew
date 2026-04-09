"use client";

export function Footer() {
  return (
    <footer
      className="px-4 py-4 flex items-center justify-between gap-3 flex-wrap"
      style={{ borderTop: "1px solid var(--border-primary)" }}
    >
      {/* Left: credits */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Made with ☕ by{" "}
        <a
          href="https://twosetai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          TwoSetAI
        </a>
        <span className="mx-1.5" style={{ color: "var(--text-faint)" }}>·</span>
        Inspired by{" "}
        <a
          href="https://youtu.be/kUqgczTQDRc?si=6VeC8XkJ2on1RK63"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:underline"
        >
          my conversation with Devi Parikh, CEO of Yutori
        </a>
      </p>

      {/* Right: enjoying your brew + coffee button */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Enjoying your brew? ☕
        </span>
        <a
          href="https://buymeacoffee.com/angelinayang"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: "var(--accent-surface)",
            color: "var(--accent-text)",
            border: "1px solid var(--accent)",
          }}
        >
          Buy me a coffee
        </a>
      </div>
    </footer>
  );
}
