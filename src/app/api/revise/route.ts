import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/anthropic";
import { COUNCIL } from "@/lib/personas";
import { CouncilReview } from "@/lib/types";

const DRAFT_MARKER = "===REVISED DRAFT===";
const CHANGES_MARKER = "===CHANGES===";

export async function POST(req: NextRequest) {
  const { draft, reviews, rawFile }: { draft: string; reviews: CouncilReview[]; rawFile: string } =
    await req.json();

  if (!draft || !reviews?.length) {
    return NextResponse.json({ error: "draft and reviews are required" }, { status: 400 });
  }

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

  try {
    const raw = await askClaude(system, userMessage, 2000);
    const draftStart = raw.indexOf(DRAFT_MARKER);
    const changesStart = raw.indexOf(CHANGES_MARKER);
    if (draftStart === -1 || changesStart === -1) {
      return NextResponse.json({ draft: raw.trim(), changesSummary: "" });
    }
    const revisedDraft = raw.slice(draftStart + DRAFT_MARKER.length, changesStart).trim();
    const changesSummary = raw.slice(changesStart + CHANGES_MARKER.length).trim();
    return NextResponse.json({ draft: revisedDraft, changesSummary });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
