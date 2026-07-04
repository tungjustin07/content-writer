import { NextRequest, NextResponse } from "next/server";
import { getNextInterviewQuestion } from "@/lib/pipeline";
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

  if (!INTERVIEWERS[interviewer]) {
    return NextResponse.json({ error: "unknown interviewer" }, { status: 400 });
  }

  try {
    const question = await getNextInterviewQuestion(interviewer, idea, research, priorTurns);
    return NextResponse.json({ question });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
