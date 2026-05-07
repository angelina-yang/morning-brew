"use client";

interface BrewNowButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function BrewNowButton({ onClick, disabled, label = "Brew now" }: BrewNowButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
      style={{ background: "var(--accent)" }}
      title="Pulls fresh updates and generates a digest. Charged directly to your Yutori and Anthropic accounts. We do not see or control these charges."
    >
      <span className="text-base leading-none">☕</span>
      {label}
    </button>
  );
}
