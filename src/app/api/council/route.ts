import { NextRequest, NextResponse } from "next/server";
import { askClaudeForJSON } from "@/lib/anthropic";
import { COUNCIL, COUNCIL_ORDER } from "@/lib/personas";
import { CouncilMemberId, CouncilReview } from "@/lib/types";

async function reviewAs(member: CouncilMemberId, draft: string): Promise<CouncilReview> {
  const persona = COUNCIL[member];
  const userMessage = `Score this draft out of 10 on your specific focus (${persona.focus}). Be a tough grader — a 9 or 10 should be rare. Draft:\n\n${draft}\n\nRespond as JSON: {"score": <integer 0-10>, "feedback": "<2-3 sentences of specific, actionable feedback>"}`;
  const result = await askClaudeForJSON<{ score: number; feedback: string }>(
    persona.systemPrompt,
    userMessage,
    400
  );
  return { member, score: result.score, feedback: result.feedback };
}

export async function POST(req: NextRequest) {
  const { draft }: { draft: string } = await req.json();
  if (!draft) return NextResponse.json({ error: "draft is required" }, { status: 400 });

  try {
    const reviews = await Promise.all(COUNCIL_ORDER.map((member) => reviewAs(member, draft)));
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
