"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StepShell } from "@/components/ui/StepShell";
import { COUNCIL } from "@/lib/personas";
import { CouncilReview } from "@/lib/types";

export function CouncilStep({
  draft,
  reviews,
  onChange,
  onNext,
}: {
  draft: string;
  reviews: CouncilReview[];
  onChange: (reviews: CouncilReview[]) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCouncil() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Council review failed");
      onChange(data.reviews);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (reviews.length === 0) runCouncil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPass = reviews.length > 0 && reviews.every((r) => r.score >= 9);

  return (
    <StepShell
      step={7}
      title="The writer's council"
      subtitle="Every draft gets reviewed by six personas. Each scores it out of 10 on their own focus."
    >
      <div className="space-y-5">
        <Button onClick={runCouncil} disabled={loading}>
          {loading ? "Reviewing..." : reviews.length ? "Re-run council" : "Run the council"}
        </Button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {reviews.length > 0 && (
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
                  <div className="text-xs text-neutral-500 mb-2">{persona.focus}</div>
                  <p className="text-sm text-neutral-300">{r.feedback}</p>
                </div>
              );
            })}
          </div>
        )}

        {reviews.length > 0 && (
          <Button onClick={onNext}>
            {allPass ? "All scores ≥ 9 — continue to finalize" : "Continue to the revision loop"}
          </Button>
        )}
      </div>
    </StepShell>
  );
}
