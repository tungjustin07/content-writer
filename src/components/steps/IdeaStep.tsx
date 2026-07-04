"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { IdeaInput } from "@/lib/types";

const ORIGINS: { id: IdeaInput["origin"]; label: string; sub: string }[] = [
  { id: "own_idea", label: "My own idea", sub: "Something I've been thinking about" },
  { id: "recent_experience", label: "Recent experience", sub: "Something that just happened to me" },
  { id: "recurring_question", label: "A question I keep getting", sub: "Something people always ask me" },
  { id: "observation", label: "An observation", sub: "Something I noticed in the world" },
];

export function IdeaStep({
  idea,
  onChange,
  onNext,
}: {
  idea: IdeaInput | null;
  onChange: (v: IdeaInput) => void;
  onNext: () => void;
}) {
  const [text, setText] = useState(idea?.idea ?? "");
  const [origin, setOrigin] = useState<IdeaInput["origin"]>(idea?.origin ?? "own_idea");

  function next() {
    onChange({ idea: text, origin });
    onNext();
  }

  return (
    <StepShell
      step={2}
      title={
        <>
          What do you want <span className="text-accent">to write about?</span>
        </>
      }
      subtitle="Don't overthink it. A rough idea is enough — the interview panel will help you develop it."
    >
      <div className="space-y-6">
        <div>
          <Textarea
            rows={4}
            placeholder="e.g. A post for my team explaining why content is one of the highest leverage things a company or professional can do in 2026"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-3">Where did this come from?</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ORIGINS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOrigin(o.id)}
                className={`text-left rounded-md border px-4 py-3 transition-colors ${
                  origin === o.id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-neutral-500"
                }`}
              >
                <div className="text-sm font-medium">{o.label}</div>
                <div className="text-xs text-neutral-500">{o.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={next} disabled={!text.trim()}>
          Continue
        </Button>
      </div>
    </StepShell>
  );
}
