"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { CONTENT_FORMATS, ContentFormat } from "@/lib/types";

export function DraftStep({
  rawFile,
  styleSummary,
  format,
  draft,
  onFormatChange,
  onDraftChange,
  onNext,
}: {
  rawFile: string;
  styleSummary?: string;
  format: ContentFormat | null;
  draft: string | null;
  onFormatChange: (f: ContentFormat) => void;
  onDraftChange: (d: string) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!format) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawFile, format, styleSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate draft");
      onDraftChange(data.draft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StepShell
      step={6}
      title="The draft"
      subtitle="Only now does it write — loading your style guide, past feedback, and the format spec. A LinkedIn post, X thread, essay, playbook, podcast promo, and video clip each get treated differently."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CONTENT_FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFormatChange(f.id)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                format === f.id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-neutral-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button onClick={generate} disabled={!format || loading}>
          {loading ? "Writing..." : draft ? "Regenerate draft" : "Generate draft"}
        </Button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {draft && (
          <>
            <Textarea rows={16} value={draft} onChange={(e) => onDraftChange(e.target.value)} />
            <Button onClick={onNext}>Send to the writer&apos;s council</Button>
          </>
        )}
      </div>
    </StepShell>
  );
}
