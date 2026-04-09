import { NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 10;

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { name, email, newsletter } = await req.json();

    // Input validation
    if (!name || !email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (name.length > 200 || email.length > 320) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // Log to Google Sheet (non-blocking)
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          newsletter: newsletter ? "Yes" : "No",
          source: "morning-brew",
          timestamp: new Date().toISOString(),
        }),
        redirect: "follow",
      }).catch(() => {
        // Don't block registration on webhook failure
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
