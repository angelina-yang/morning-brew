import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const { yutoriApiKey, claudeApiKey } = await req.json();

    const results = { yutori: false, claude: false, errors: {} as Record<string, string> };

    // Validate Yutori key
    if (yutoriApiKey) {
      try {
        const res = await fetch("https://api.yutori.com/v1/scouting/tasks", {
          headers: { "X-API-KEY": yutoriApiKey },
        });
        if (res.ok || res.status === 200) {
          results.yutori = true;
        } else {
          results.errors.yutori = `Invalid Yutori API key (${res.status})`;
        }
      } catch (err) {
        results.errors.yutori = err instanceof Error ? err.message : "Failed to validate Yutori key";
      }
    }

    // Validate Claude key
    if (claudeApiKey) {
      try {
        const client = new Anthropic({ apiKey: claudeApiKey });
        await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5,
          messages: [{ role: "user", content: "Hi" }],
        });
        results.claude = true;
      } catch (err) {
        results.errors.claude = err instanceof Error ? err.message : "Failed to validate Claude key";
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 500 }
    );
  }
}
