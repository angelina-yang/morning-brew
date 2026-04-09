const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese (Mandarin)",
  es: "Spanish",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  pt: "Portuguese",
};

export function buildDigestPrompt(language: string = "en"): string {
  const langName = LANGUAGE_NAMES[language] || "English";
  const languageInstruction =
    language === "en"
      ? ""
      : `\n- IMPORTANT: Write all titles and summaries in ${langName}.`;

  return `You are a news editor curating a daily morning digest. Your job is to take raw updates from multiple web monitoring scouts and produce a clean, ranked, deduplicated digest.

Rules:
- Rank items by relevance and importance (most important first)
- Deduplicate: if multiple scouts found the same news, merge into one item
- For each item, write a clear title and a 2-3 sentence summary
- Include the most relevant source URL for each item
- Cap the digest at 15 items maximum
- Skip trivial updates, minor edits, or non-newsworthy changes
- Focus on what changed and why it matters${languageInstruction}

Return a JSON array of objects with this exact schema:
[
  {
    "title": "Short descriptive title",
    "summary": "2-3 sentence summary of what happened and why it matters",
    "sourceUrl": "https://...",
    "sourceName": "Source name (e.g., TechCrunch, Hacker News)",
    "scoutQuery": "Which scout found this",
    "timestamp": "ISO 8601 timestamp of the update"
  }
]

Return ONLY the JSON array, no markdown fences, no explanation.`;
}

export function buildDraftPostPrompt(
  platform: "tweet" | "linkedin",
  summary: string,
  title: string,
  userInstructions?: string
): { system: string; userMessage: string } {
  const platformRules =
    platform === "tweet"
      ? `You are a Twitter/X ghostwriter. Write a single tweet (max 280 characters) based on the summary below.

Rules:
- Stay under 280 characters including any hashtags
- Make it punchy, insightful, and shareable
- Don't use quotation marks around the entire tweet
- 1-2 hashtags max, only if they add value
- No thread format — just one tweet
- Don't start with "Just learned" or "Did you know"
- Do not use em dashes`
      : `You are a LinkedIn post writer. Write a professional but engaging LinkedIn post based on the summary below.

Rules:
- Keep it between 100-300 words
- Start with a hook line that grabs attention
- Use short paragraphs (1-2 sentences each) with line breaks between them
- End with a question or call-to-action to drive engagement
- Keep it authentic and thoughtful, not salesy
- 3-5 hashtags at the end
- No emojis unless the user specifically asks for them
- Do not use em dashes`;

  const instructionBlock = userInstructions?.trim()
    ? `\n\nThe user has these style preferences — follow them:\n${userInstructions.trim()}`
    : "";

  return {
    system: `${platformRules}${instructionBlock}`,
    userMessage: `Here is a summary of "${title}":\n\n${summary}\n\nWrite a ${platform === "tweet" ? "tweet" : "LinkedIn post"} about this.`,
  };
}
