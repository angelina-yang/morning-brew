import { NextResponse } from "next/server";
import { listScouts, createScout } from "@/lib/yutori";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 15;

export async function GET(req: Request) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`scouts-list:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = req.headers.get("x-yutori-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Yutori API key" }, { status: 401 });
  }

  try {
    const scouts = await listScouts(apiKey);
    return NextResponse.json({ scouts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list scouts";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`scouts-create:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = req.headers.get("x-yutori-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Yutori API key" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const scout = await createScout(apiKey, {
      query: body.query.trim(),
      output_interval: body.output_interval,
      user_timezone: body.user_timezone,
      skip_email: true,
    });

    return NextResponse.json({ scout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create scout";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
