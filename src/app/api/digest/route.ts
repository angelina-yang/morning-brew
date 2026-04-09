import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildDigestPrompt } from "@/lib/prompts";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`digest:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const claudeApiKey = req.headers.get("x-claude-api-key");
  if (!claudeApiKey) {
    return NextResponse.json({ error: "Missing Claude API key" }, { status: 401 });
  }

  try {
    const { updates, language } = await req.json();

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No updates to digest" }, { status: 400 });
    }

    // Format updates for Claude, truncate to 50K chars
    const formattedUpdates = updates
      .map(
        (u: { scout_query?: string; content?: string; sources?: { url: string; title: string }[]; created_at?: string }) =>
          `[Scout: ${u.scout_query || "unknown"}] [Time: ${u.created_at || "unknown"}]\n${u.content || ""}\nSources: ${(u.sources || []).map((s) => `${s.title} (${s.url})`).join(", ")}`
      )
      .join("\n\n---\n\n");

    const truncated = formattedUpdates.slice(0, 50_000);

    const client = new Anthropic({ apiKey: claudeApiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildDigestPrompt(language || "en"),
      messages: [
        {
          role: "user",
          content: `Here are the raw updates from my web monitoring scouts. Please curate them into a morning digest:\n\n${truncated}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    let items;
    try {
      items = JSON.parse(textBlock.text);
    } catch {
      // Claude might have wrapped in markdown fences
      const match = textBlock.text.match(/\[[\s\S]*\]/);
      if (match) {
        items = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse digest response");
      }
    }

    return NextResponse.json({
      items,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Digest generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate digest" },
      { status: 500 }
    );
  }
}
