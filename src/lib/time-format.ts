/**
 * Human-friendly time formatting for scout schedule display.
 *
 *   formatRelativeFuture("2026-04-21T14:00:00Z")
 *     → "in 2h"
 *     → "tomorrow at 7am"
 *     → "Fri at 7am"
 *
 *   formatRelativePast("2026-04-17T17:41:00Z")
 *     → "2 days ago"
 *     → "3 hours ago"
 *     → "just now"
 */

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeOfDay(d: Date): string {
  // "7am", "7:30am", "2pm"
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: d.getMinutes() === 0 ? undefined : "2-digit",
    hour12: true,
  }).replace(/\s/g, "").toLowerCase();
}

export function formatRelativeFuture(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return "any moment";

  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `in ${diffMin}m`;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isSameLocalDay(d, now)) {
    return `today at ${formatTimeOfDay(d)}`;
  }
  if (isSameLocalDay(d, tomorrow)) {
    return `tomorrow at ${formatTimeOfDay(d)}`;
  }

  // Within the next 7 days → show weekday
  const daysOut = Math.floor(diffMs / 86_400_000);
  if (daysOut < 7) {
    const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
    return `${weekday} at ${formatTimeOfDay(d)}`;
  }

  // Further out → absolute short date
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatRelativePast(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60_000) return "just now";

  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
