import { INTERVIEWERS } from "./personas";
import { IdeaInput, InterviewTurn, ResearchNote, VoiceProfile } from "./types";

const ORIGIN_LABEL: Record<IdeaInput["origin"], string> = {
  own_idea: "My own idea",
  recurring_question: "A question I keep getting",
  recent_experience: "A recent experience",
  observation: "An observation",
};

/**
 * Deterministic compilation into the raw markdown "source of truth" — no LLM involved,
 * so nothing here can be fabricated. The draft step only ever writes from this file.
 */
export function compileRawFile(input: {
  idea: IdeaInput | null;
  voice: VoiceProfile | null;
  research: ResearchNote[];
  interview: InterviewTurn[];
}): string {
  const { idea, voice, research, interview } = input;
  const parts: string[] = [];

  parts.push(`# Raw file\n`);

  if (idea) {
    parts.push(`## The idea\n\n**Origin:** ${ORIGIN_LABEL[idea.origin]}\n\n${idea.idea}\n`);
  }

  if (voice?.styleSummary) {
    parts.push(`## Voice profile\n\n${voice.styleSummary}\n`);
  }

  if (research.length) {
    parts.push(
      `## Research\n\n${research
        .map((r) => `_Source: ${r.source}_\n\n${r.content}`)
        .join("\n\n---\n\n")}\n`
    );
  }

  if (interview.length) {
    const byPersona = new Map<string, InterviewTurn[]>();
    for (const turn of interview) {
      const list = byPersona.get(turn.interviewer) ?? [];
      list.push(turn);
      byPersona.set(turn.interviewer, list);
    }
    parts.push(`## Interview panel\n`);
    for (const [interviewer, turns] of byPersona) {
      const persona = INTERVIEWERS[interviewer as keyof typeof INTERVIEWERS];
      parts.push(
        `### ${persona.name} (${persona.mode})\n\n${turns
          .map((t) => `**Q:** ${t.question}\n**A:** ${t.answer}`)
          .join("\n\n")}\n`
      );
    }
  }

  return parts.join("\n");
}
