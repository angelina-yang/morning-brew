import { NextResponse } from "next/server";
import { getScoutUpdates } from "@/lib/yutori";

export const maxDuration = 30;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = req.headers.get("x-yutori-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Yutori API key" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    const updates = await getScoutUpdates(apiKey, id, limit);
    return NextResponse.json({ updates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get updates";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
