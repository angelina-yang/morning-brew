import { NextResponse } from "next/server";
import { getScout, updateScout, deleteScout, pauseScout, resumeScout } from "@/lib/yutori";

export const maxDuration = 15;

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
    const scout = await getScout(apiKey, id);
    return NextResponse.json({ scout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get scout";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = req.headers.get("x-yutori-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Yutori API key" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Yutori's PATCH does NOT accept status — it must go through the
    // dedicated pause/resume endpoints. Route accordingly.
    if (typeof body.status === "string") {
      if (body.status === "paused") {
        await pauseScout(apiKey, id);
      } else if (body.status === "active") {
        await resumeScout(apiKey, id);
      } else {
        return NextResponse.json(
          { error: `Invalid status: ${body.status}` },
          { status: 400 }
        );
      }
      // Fetch the latest scout state so the client can reconcile
      const scout = await getScout(apiKey, id);
      return NextResponse.json({ scout });
    }

    // Non-status updates (query, output_interval) use PATCH
    const scout = await updateScout(apiKey, id, body);
    return NextResponse.json({ scout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update scout";
    const status = (err as { status?: number }).status || 500;
    const errorCode = (err as { errorCode?: string }).errorCode;
    return NextResponse.json({ error: message, errorCode }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = req.headers.get("x-yutori-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Yutori API key" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteScout(apiKey, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete scout";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
