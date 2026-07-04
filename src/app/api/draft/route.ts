import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/anthropic";
import { FORMAT_SPEC } from "@/lib/formats";
import { pastFeedbackDigest } from "@/lib/storage";
import { ContentFormat } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { rawFile, format, styleSummary }: { rawFile: string; format: ContentFormat; styleSummary?: string } =
    await req.json();

  if (!rawFile) return NextResponse.json({ error: "rawFile is required" }, { status: 400 });
  const spec = FORMAT_SPEC[format];
  if (!spec) return NextResponse.json({ error: "unknown format" }, { status: 400 });

  const pastFeedback = await pastFeedbackDigest();

  const system =
    "You are a skilled ghostwriter. You write ONLY from the raw file you are given — never invent facts, quotes, statistics, or events that aren't in it. If the raw file is thin on a point, write around it rather than fabricating specifics. Match the writer's voice profile precisely.";

  const userMessage = [
    styleSummary ? `Style guide (match this voice):\n${styleSummary}\n` : "",
    pastFeedback ? `Recurring feedback from past drafts — actively avoid repeating these:\n${pastFeedback}\n` : "",
    `Content format spec:\n${spec}\n`,
    `Raw file (source of truth — do not add facts beyond this):\n${rawFile}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const draft = await askClaude(system, userMessage, 1800);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
