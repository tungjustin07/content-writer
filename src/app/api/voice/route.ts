import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const { writingSamples, diagnosticAnswers } = await req.json();

  const answerLines = Object.entries(diagnosticAnswers ?? {})
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n");

  const system =
    "You analyze a writer's voice from samples and diagnostic answers, and produce a compact, reusable style guide. Be specific and concrete — avoid generic advice like 'be authentic'. Capture sentence rhythm, vocabulary tics, structural habits, and things to avoid.";

  const userMessage = `Writing samples:\n${writingSamples || "(none provided)"}\n\nDiagnostic answers:\n${
    answerLines || "(none provided)"
  }\n\nProduce a style guide in markdown, under 300 words, with these sections: Voice summary, Sentence rhythm, Vocabulary & tone, Avoid.`;

  try {
    const styleSummary = await askClaude(system, userMessage, 700);
    return NextResponse.json({ styleSummary });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
