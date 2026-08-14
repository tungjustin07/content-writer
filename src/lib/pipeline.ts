import { askClaude, askClaudeForJSON } from "./anthropic";
import { FORMAT_SPEC } from "./formats";
import { COUNCIL, COUNCIL_ORDER, INTERVIEWERS } from "./personas";
import { pastFeedbackDigest } from "./storage";
import {
  ContentFormat,
  CouncilMemberId,
  CouncilReview,
  InterviewerId,
  InterviewTurn,
} from "./types";

export async function generateStyleGuide(
  writingSamples: string,
  diagnosticAnswers: Record<string, string> = {}
): Promise<string> {
  const answerLines = Object.entries(diagnosticAnswers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n");

  const system =
    "You analyze a writer's voice from samples and diagnostic answers, and produce a compact, reusable style guide. Be specific and concrete — avoid generic advice like 'be authentic'. Capture sentence rhythm, vocabulary tics, structural habits, and things to avoid.";

  const userMessage = `Writing samples:\n${writingSamples || "(none provided)"}\n\nDiagnostic answers:\n${
    answerLines || "(none provided)"
  }\n\nProduce a style guide in markdown, under 300 words, with these sections: Voice summary, Sentence rhythm, Vocabulary & tone, Avoid.`;

  return askClaude(system, userMessage, 700);
}

export async function getNextInterviewQuestion(
  interviewer: InterviewerId,
  idea: string,
  research: string | undefined,
  priorTurns: InterviewTurn[]
): Promise<string> {
  const persona = INTERVIEWERS[interviewer];
  const transcript = priorTurns
    .map((t) => `[${INTERVIEWERS[t.interviewer].name}] Q: ${t.question}\nA: ${t.answer}`)
    .join("\n\n");

  const userMessage = `The writer's idea: "${idea}"\n\n${
    research ? `Research notes:\n${research}\n\n` : ""
  }Interview so far:\n${transcript || "(nothing yet — this is the first question)"}\n\nAsk the single next question, in your voice, that will get the most useful material for this piece. Output only the question, no preamble.`;

  const question = await askClaude(persona.systemPrompt, userMessage, 300);
  return question.trim();
}

export async function reviewDraftAs(member: CouncilMemberId, draft: string): Promise<CouncilReview> {
  const persona = COUNCIL[member];
  const userMessage = `Score this draft out of 10 on your specific focus (${persona.focus}). Be a tough grader — a 9 or 10 should be rare. Draft:\n\n${draft}\n\nRespond as JSON: {"score": <integer 0-10>, "feedback": "<2-3 sentences of specific, actionable feedback>"}`;
  const result = await askClaudeForJSON<{ score: number; feedback: string }>(
    persona.systemPrompt,
    userMessage,
    400
  );
  return { member, score: result.score, feedback: result.feedback };
}

export async function reviewDraftWithCouncil(draft: string): Promise<CouncilReview[]> {
  return Promise.all(COUNCIL_ORDER.map((member) => reviewDraftAs(member, draft)));
}

/** Explains WHY each judge's score moved between two versions of a draft — not just the delta. */
export async function explainScoreChanges(
  previousReviews: CouncilReview[],
  newReviews: CouncilReview[]
): Promise<string> {
  const rows = COUNCIL_ORDER.map((member) => {
    const prev = previousReviews.find((r) => r.member === member);
    const next = newReviews.find((r) => r.member === member);
    if (!prev || !next) return null;
    return `${COUNCIL[member].name} (focus: ${COUNCIL[member].focus}): ${prev.score} -> ${next.score}\nPrevious feedback: ${prev.feedback}\nNew feedback: ${next.feedback}`;
  })
    .filter(Boolean)
    .join("\n\n");

  const system =
    "You explain why a set of editorial scores changed between two draft versions. For each judge, give one sharp sentence naming the specific thing in the draft that moved the needle — not a restatement of the feedback. Call out clearly when a score went up on one axis at the cost of another (e.g. more actionable but less timeless). If a score didn't change, say so briefly.";

  return askClaude(system, `Score changes:\n\n${rows}`, 700);
}

export async function writeDraft(
  rawFile: string,
  format: ContentFormat,
  styleSummary?: string
): Promise<string> {
  const spec = FORMAT_SPEC[format];
  if (!spec) throw new Error("unknown format");

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

  return askClaude(system, userMessage, 1800);
}

const DRAFT_MARKER = "===REVISED DRAFT===";
const CHANGES_MARKER = "===CHANGES===";

export async function reviseDraft(
  draft: string,
  reviews: CouncilReview[],
  rawFile: string
): Promise<{ draft: string; changesSummary: string }> {
  const sorted = [...reviews].sort((a, b) => a.score - b.score);
  const priorityFeedback = sorted
    .filter((r) => r.score < 9)
    .map((r) => `- [${COUNCIL[r.member].name}, scored ${r.score}/10, focus: ${COUNCIL[r.member].focus}] ${r.feedback}`)
    .join("\n");

  const system =
    "You are a skilled ghostwriter revising a draft based on editorial feedback. Fix the lowest-scoring, most important problems first (a weak hook matters more than a missing comma). Never invent facts, quotes, or statistics beyond what's in the raw file. Preserve what's already working — this is a revision, not a rewrite from scratch.";

  const userMessage = `Raw file (source of truth):\n${rawFile}\n\nCurrent draft:\n${draft}\n\nEditorial feedback, ordered by priority (lowest score first):\n${
    priorityFeedback || "(no scores below 9 — polish only)"
  }\n\nRespond in exactly this format:\n${DRAFT_MARKER}\n<the full revised draft>\n${CHANGES_MARKER}\n<a short bullet list of what you changed and why, referencing which feedback it addresses>`;

  const raw = await askClaude(system, userMessage, 2000);
  const draftStart = raw.indexOf(DRAFT_MARKER);
  const changesStart = raw.indexOf(CHANGES_MARKER);
  if (draftStart === -1 || changesStart === -1) {
    return { draft: raw.trim(), changesSummary: "" };
  }
  const revisedDraft = raw.slice(draftStart + DRAFT_MARKER.length, changesStart).trim();
  const changesSummary = raw.slice(changesStart + CHANGES_MARKER.length).trim();
  return { draft: revisedDraft, changesSummary };
}
