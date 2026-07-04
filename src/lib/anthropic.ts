import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to content-machine/.env.local to use this step."
    );
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const MODEL = "claude-sonnet-4-5";

export async function askClaude(system: string, userMessage: string, maxTokens = 1024): Promise<string> {
  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

/** Asks Claude for a single JSON object matching the caller's expected shape, tolerating markdown fences. */
export async function askClaudeForJSON<T>(
  system: string,
  userMessage: string,
  maxTokens = 1024
): Promise<T> {
  const text = await askClaude(
    system + "\n\nRespond with ONLY a single valid JSON object, no markdown fences, no commentary.",
    userMessage,
    maxTokens
  );
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as T;
}
