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
      title="Pull the latest updates from your scouts and generate a fresh digest"
    >
      <span className="text-base leading-none">☕</span>
      {label}
    </button>
  );
}
