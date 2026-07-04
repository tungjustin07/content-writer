"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { ResearchNote } from "@/lib/types";

export function ResearchStep({
  idea,
  research,
  onChange,
  onNext,
}: {
  idea: string;
  research: ResearchNote[];
  onChange: (notes: ResearchNote[]) => void;
  onNext: () => void;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualNotes, setManualNotes] = useState(
    research.find((r) => r.source === "manual")?.content ?? ""
  );

  useEffect(() => {
    fetch("/api/research")
      .then((r) => r.json())
      .then((d) => setEnabled(d.enabled))
      .catch(() => setEnabled(false));
  }, []);

  async function runResearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Research failed");
      const withoutPerplexity = research.filter((r) => r.source !== "perplexity");
      onChange([...withoutPerplexity, { source: "perplexity", content: data.content }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function saveManualNotes() {
    const withoutManual = research.filter((r) => r.source !== "manual");
    if (manualNotes.trim()) {
      onChange([...withoutManual, { source: "manual", content: manualNotes }]);
    } else {
      onChange(withoutManual);
    }
  }

  const perplexityNote = research.find((r) => r.source === "perplexity");

  return (
    <StepShell
      step={3}
      title="Research agent"
      subtitle="Optional. The research agent goes out and finds stats, data, and counterarguments. You can layer your own notes on top."
    >
      <div className="space-y-5">
        {enabled === false && (
          <p className="text-sm text-neutral-500">
            No PERPLEXITY_API_KEY configured — live research is disabled. Add your own notes below instead.
          </p>
        )}

        {enabled && (
          <div>
            <Button onClick={runResearch} disabled={loading}>
              {loading ? "Researching..." : "Run research agent"}
            </Button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {perplexityNote && (
              <div className="mt-4 bg-surface border border-border rounded-lg p-4">
                <Label>Findings</Label>
                <pre className="whitespace-pre-wrap text-sm text-neutral-200 font-sans">
                  {perplexityNote.content}
                </pre>
              </div>
            )}
          </div>
        )}

        <div>
          <Label>Your own notes (optional)</Label>
          <Textarea
            rows={5}
            placeholder="Add any data, quotes, or context you already have..."
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            onBlur={saveManualNotes}
          />
        </div>

        <Button
          onClick={() => {
            saveManualNotes();
            onNext();
          }}
        >
          Continue
        </Button>
      </div>
    </StepShell>
  );
}
