import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildDraftPostPrompt } from "@/lib/prompts";

export const maxDuration = 30;

export async function POST(req: Request) {
  const claudeApiKey = req.headers.get("x-claude-api-key");
  if (!claudeApiKey) {
    return NextResponse.json({ error: "Missing Claude API key" }, { status: 401 });
  }

  try {
    const { platform, summary, title, instructions } = await req.json();

    if (!platform || !summary || !title) {
      return NextResponse.json(
        { error: "Missing required fields: platform, summary, title" },
        { status: 400 }
      );
    }

    const { system, userMessage } = buildDraftPostPrompt(
      platform,
      summary,
      title,
      instructions
    );

    const client = new Anthropic({ apiKey: claudeApiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return NextResponse.json({ draft: textBlock.text });
  } catch (err) {
    console.error("Draft post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate draft" },
      { status: 500 }
    );
  }
}
