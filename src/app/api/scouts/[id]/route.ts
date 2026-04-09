import { NextResponse } from "next/server";
import { getScout, updateScout, deleteScout } from "@/lib/yutori";

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
    const scout = await updateScout(apiKey, id, body);
    return NextResponse.json({ scout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update scout";
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
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
