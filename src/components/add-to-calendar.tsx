"use client";

/**
 * Generates an .ics file for a recurring 7 AM "Daily Brew" calendar event
 * and triggers a download. The user's calendar app (Google Calendar, Apple
 * Calendar, Outlook) will prompt them to add the recurring series on open.
 *
 * This is a nudge, not a guarantee of return visits — but it's zero-infra
 * and zero-BYOK-violation.
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function buildIcs(appUrl: string): string {
  // Next 7 AM in the user's local time, expressed as UTC in the .ics
  const now = new Date();
  const start = new Date();
  start.setHours(7, 0, 0, 0);
  if (start <= now) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 15 * 60 * 1000); // 15-min block

  const dtstamp = formatDateUTC(new Date());
  const dtstart = formatDateUTC(start);
  const dtend = formatDateUTC(end);
  const uid = `daily-brew-${start.getTime()}@twosetai.com`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TwoSetAI//Daily Brew//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "SUMMARY:☕ Daily Brew — your morning digest",
    `DESCRIPTION:Your 5-minute daily AI digest. Open Daily Brew: ${appUrl}`,
    `URL:${appUrl}`,
    "RRULE:FREQ=DAILY",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daily Brew is ready ☕",
    "TRIGGER:-PT5M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function AddToCalendarButton() {
  const handleClick = () => {
    const appUrl =
      typeof window !== "undefined" ? window.location.origin : "https://dailybrew.twosetai.com";
    const ics = buildIcs(appUrl);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "daily-brew.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={{
        background: "transparent",
        color: "var(--text-muted)",
        border: "1px solid var(--border-secondary)",
      }}
      title="Download an .ics file that adds a recurring 7 AM reminder to your calendar"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      Add to calendar
    </button>
  );
}
