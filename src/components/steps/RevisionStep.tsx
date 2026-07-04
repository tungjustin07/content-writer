"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StepShell } from "@/components/ui/StepShell";
import { COUNCIL } from "@/lib/personas";
import { CouncilReview, RevisionEntry } from "@/lib/types";

const MAX_ITERATIONS = 5;

export function RevisionStep({
  rawFile,
  draft,
  reviews,
  revisions,
  onDraftChange,
  onReviewsChange,
  onRevisionsChange,
  onFinish,
}: {
  rawFile: string;
  draft: string;
  reviews: CouncilReview[];
  revisions: RevisionEntry[];
  onDraftChange: (d: string) => void;
  onReviewsChange: (r: CouncilReview[]) => void;
  onRevisionsChange: (r: RevisionEntry[]) => void;
  onFinish: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allPass = reviews.every((r) => r.score >= 9);
  const lowest = [...reviews].sort((a, b) => a.score - b.score)[0];

  async function reviseOnce() {
    setLoading(true);
    setError(null);
    try {
      const reviseRes = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, reviews, rawFile }),
      });
      const reviseData = await reviseRes.json();
      if (!reviseRes.ok) throw new Error(reviseData.error ?? "Revision failed");

      const councilRes = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: reviseData.draft }),
      });
      const councilData = await councilRes.json();
      if (!councilRes.ok) throw new Error(councilData.error ?? "Re-review failed");

      onDraftChange(reviseData.draft);
      onReviewsChange(councilData.reviews);
      onRevisionsChange([
        ...revisions,
        {
          iteration: revisions.length + 1,
          changesSummary: reviseData.changesSummary,
          draft: reviseData.draft,
          reviews: councilData.reviews,
        },
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StepShell
      step={8}
      title="The revision loop"
      subtitle="Score below 9? It revises — fixing the lowest-scoring issue first. After the final version, the system logs what changed, so the next first draft starts smarter."
    >
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-3">
          {reviews.map((r) => {
            const persona = COUNCIL[r.member];
            return (
              <div key={r.member} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{persona.name}</div>
                  <div className={`text-lg font-serif ${r.score >= 9 ? "text-accent" : "text-neutral-400"}`}>
                    {r.score}/10
                  </div>
                </div>
                <p className="text-sm text-neutral-300">{r.feedback}</p>
              </div>
            );
          })}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!allPass && revisions.length < MAX_ITERATIONS && (
          <Button onClick={reviseOnce} disabled={loading}>
            {loading
              ? "Revising..."
              : `Revise — fix "${lowest ? COUNCIL[lowest.member].focus : ""}" first`}
          </Button>
        )}

        {revisions.length >= MAX_ITERATIONS && !allPass && (
          <p className="text-sm text-neutral-500">
            Hit the {MAX_ITERATIONS}-iteration safety cap. Take the current draft or keep editing by hand.
          </p>
        )}

        {revisions.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Revision log</div>
            <div className="space-y-2">
              {revisions.map((rev) => (
                <div key={rev.iteration} className="bg-surface border border-border rounded-lg p-3 text-sm">
                  <div className="text-accent text-xs mb-1">Iteration {rev.iteration}</div>
                  <div className="text-neutral-300 whitespace-pre-wrap">{rev.changesSummary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Final draft</div>
          <pre className="whitespace-pre-wrap text-sm bg-surface border border-border rounded-lg p-4 font-sans">
            {draft}
          </pre>
        </div>

        <Button onClick={onFinish} variant={allPass ? "primary" : "secondary"}>
          {allPass ? "Done — all scores ≥ 9" : "Stop here and finish anyway"}
        </Button>
      </div>
    </StepShell>
  );
}
