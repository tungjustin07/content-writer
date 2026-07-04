"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Label, Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { VOICE_DIAGNOSTIC_QUESTIONS } from "@/lib/personas";
import { VoiceProfile } from "@/lib/types";

export function VoiceStep({
  voice,
  onChange,
  onNext,
}: {
  voice: VoiceProfile | null;
  onChange: (v: VoiceProfile | null) => void;
  onNext: () => void;
}) {
  const [samples, setSamples] = useState(voice?.writingSamples ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>(voice?.diagnosticAnswers ?? {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingSamples: samples, diagnosticAnswers: answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate style guide");
      onChange({ writingSamples: samples, diagnosticAnswers: answers, styleSummary: data.styleSummary });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StepShell
      step={1}
      title="Tune your voice"
      subtitle="Optional. Upload writing examples, answer a few quick questions. The machine learns how you write before it does anything else."
    >
      <div className="space-y-4">
        <div>
          <Label>Paste writing examples</Label>
          <Textarea
            rows={6}
            placeholder="Paste a few paragraphs you've written that sound like you..."
            value={samples}
            onChange={(e) => setSamples(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {VOICE_DIAGNOSTIC_QUESTIONS.map((q) => (
            <div key={q}>
              <Label>{q}</Label>
              <Textarea
                rows={2}
                value={answers[q] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {voice?.styleSummary && (
          <Card>
            <Label>Style guide</Label>
            <pre className="whitespace-pre-wrap text-sm text-neutral-200 font-sans">{voice.styleSummary}</pre>
          </Card>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button onClick={generate} disabled={loading}>
            {loading ? "Analyzing..." : "Generate style guide"}
          </Button>
          <Button variant="secondary" onClick={onNext}>
            Skip this step
          </Button>
          {voice?.styleSummary && (
            <Button variant="secondary" onClick={onNext} className="ml-auto">
              Continue
            </Button>
          )}
        </div>
      </div>
    </StepShell>
  );
}
