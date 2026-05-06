"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserInfo } from "@/types";

const STORAGE_KEY = "morning-brew-user";

/**
 * One-time backfill window: registrations that happened in this browser
 * before this date may have been silently dropped by a fire-and-forget
 * fetch bug on Vercel. We re-fire those once on next app load to make
 * sure they land in the Google Sheet. New registrations after this date
 * are saved with `serverSynced: true` immediately and are never re-fired.
 *
 * The Apps Script `doPost` handles `backfill: true` by checking the
 * sheet first and skipping if (email, source) already exists.
 */
const BACKFILL_BEFORE = new Date("2026-05-05T22:00:00Z").getTime();

async function fireBackfillRegistration(user: UserInfo): Promise<boolean> {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        newsletter: false, // We didn't store this on the original record
        backfill: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
    setLoaded(true);
  }, []);

  // One-time backfill: if the user is locally registered but has never been
  // synced to the server (and was registered before today's fix deploy),
  // re-POST to /api/register so they land in the sheet. Marks synced
  // afterwards so this only runs once per browser.
  useEffect(() => {
    if (!loaded || !user) return;
    if (user.serverSynced) return;

    const registeredAtMs = Date.parse(user.registeredAt);
    if (isNaN(registeredAtMs) || registeredAtMs >= BACKFILL_BEFORE) {
      // Registered after today's fix — already in the sheet (the welcome
      // modal awaited the POST). Just mark as synced and move on.
      const synced = { ...user, serverSynced: true };
      setUser(synced);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
      } catch {}
      return;
    }

    // Pre-fix registration — fire backfill, then mark synced regardless of
    // outcome (so we don't keep retrying every app load).
    let cancelled = false;
    fireBackfillRegistration(user).finally(() => {
      if (cancelled) return;
      const synced = { ...user, serverSynced: true };
      setUser(synced);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
      } catch {}
    });
    return () => {
      cancelled = true;
    };
  }, [loaded, user]);

  const register = useCallback((name: string, email: string) => {
    const info: UserInfo = {
      name,
      email,
      registeredAt: new Date().toISOString(),
      serverSynced: true, // Welcome modal awaits the POST, so this is true by definition
    };
    setUser(info);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }, []);

  const isRegistered = Boolean(user);

  return { user, isRegistered, loaded, register };
}
