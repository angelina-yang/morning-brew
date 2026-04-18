"use client";

import { useEffect, useState } from "react";

interface GreetingBannerProps {
  name: string;
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function GreetingBanner({ name }: GreetingBannerProps) {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");

  // Compute on client to avoid SSR/hydration mismatch on timezone-sensitive output
  useEffect(() => {
    const tod = getTimeOfDay();
    const firstName = name.trim().split(" ")[0] || "";
    const emoji = tod === "morning" ? "☕" : tod === "afternoon" ? "🫖" : "🌙";
    setGreeting(
      firstName
        ? `Good ${tod}, ${firstName} ${emoji}`
        : `Good ${tod} ${emoji}`
    );
    setDate(`Here's your brew for ${formatDate()}.`);
  }, [name]);

  if (!greeting) return null;

  return (
    <div className="mb-2">
      <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {greeting}
      </h1>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
        {date}
      </p>
    </div>
  );
}
