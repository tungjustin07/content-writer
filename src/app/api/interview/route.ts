import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/anthropic";
import { INTERVIEWERS } from "@/lib/personas";
import { InterviewerId, InterviewTurn } from "@/lib/types";

export async function POST(req: NextRequest) {
  const {
    interviewer,
    idea,
    research,
    priorTurns,
  }: {
    interviewer: InterviewerId;
    idea: string;
    research?: string;
    priorTurns: InterviewTurn[];
  } = await req.json();

  const persona = INTERVIEWERS[interviewer];
  if (!persona) {
    return NextResponse.json({ error: "unknown interviewer" }, { status: 400 });
  }

  const transcript = priorTurns
    .map((t) => `[${INTERVIEWERS[t.interviewer].name}] Q: ${t.question}\nA: ${t.answer}`)
    .join("\n\n");

  const userMessage = `The writer's idea: "${idea}"\n\n${
    research ? `Research notes:\n${research}\n\n` : ""
  }Interview so far:\n${transcript || "(nothing yet — this is the first question)"}\n\nAsk the single next question, in your voice, that will get the most useful material for this piece. Output only the question, no preamble.`;

  try {
    const question = await askClaude(persona.systemPrompt, userMessage, 300);
    return NextResponse.json({ question: question.trim() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
