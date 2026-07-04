"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { IdeaInput, InterviewTurn, ResearchNote, VoiceProfile } from "@/lib/types";

export function RawFileStep({
  idea,
  voice,
  research,
  interview,
  rawFile,
  onChange,
  onNext,
}: {
  idea: IdeaInput | null;
  voice: VoiceProfile | null;
  research: ResearchNote[];
  interview: InterviewTurn[];
  rawFile: string | null;
  onChange: (rawFile: string) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function compile() {
    setLoading(true);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, voice, research, interview }),
      });
      const data = await res.json();
      onChange(data.rawFile);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!rawFile) compile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepShell
      step={5}
      title="The raw file"
      subtitle="Everything gets compiled into a raw markdown file — the source of truth. Nothing here was invented; the draft step can only write from this."
    >
      <div className="space-y-4">
        <Textarea
          rows={20}
          className="font-mono text-xs"
          value={rawFile ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={compile} disabled={loading}>
            {loading ? "Recompiling..." : "Recompile from scratch"}
          </Button>
          <Button onClick={onNext} disabled={!rawFile}>
            Continue
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
