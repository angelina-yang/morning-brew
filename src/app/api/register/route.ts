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

    // Log to signup webhook (Google Apps Script).
    //
    // IMPORTANT: must AWAIT the fetch (not fire-and-forget). On Vercel
    // serverless, the lambda is killed within milliseconds of returning
    // its response — so a fire-and-forget fetch usually never gets sent.
    // Previous bug: real registrations silently never reached the sheet.
    //
    // Apps Script POST returns 302 redirecting to a googleusercontent
    // URL with a short-lived `user_content_key`. We use redirect: "manual"
    // and follow the redirect manually so failure to retrieve the response
    // body doesn't error out the awaited fetch — by the time we get the
    // 302, doPost has already executed and appended the row.
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK;
    if (webhookUrl) {
      try {
        const sheetRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            newsletter: newsletter ? "Yes" : "No",
            source: "morning-brew",
            timestamp: new Date().toISOString(),
          }),
          redirect: "manual",
          signal: AbortSignal.timeout(5000),
        });
        if (sheetRes.status === 302 || sheetRes.status === 301) {
          const redirectUrl = sheetRes.headers.get("location");
          if (redirectUrl) {
            await fetch(redirectUrl, {
              signal: AbortSignal.timeout(5000),
            }).catch(() => {});
          }
        }
      } catch {
        // Don't block registration on webhook failure — but the appendRow
        // has very likely already happened on Apps Script's side.
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
