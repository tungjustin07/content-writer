"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { StepShell } from "@/components/ui/StepShell";
import { INTERVIEWER_ORDER, INTERVIEWERS } from "@/lib/personas";
import { InterviewerId, InterviewTurn } from "@/lib/types";

export function InterviewStep({
  idea,
  research,
  turns,
  onChange,
  onNext,
}: {
  idea: string;
  research: string;
  turns: InterviewTurn[];
  onChange: (turns: InterviewTurn[]) => void;
  onNext: () => void;
}) {
  const [active, setActive] = useState<InterviewerId>(INTERVIEWER_ORDER[0]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTurns = turns.filter((t) => t.interviewer === active);

  async function askNext() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewer: active, idea, research, priorTurns: turns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get question");
      setPendingQuestion(data.question);
      setAnswer("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function submitAnswer() {
    if (!pendingQuestion || !answer.trim()) return;
    onChange([...turns, { interviewer: active, question: pendingQuestion, answer }]);
    setPendingQuestion(null);
    setAnswer("");
  }

  return (
    <StepShell
      step={4}
      title="The interview panel"
      subtitle="The machine doesn't write yet. It interviews you — pick a persona and answer as many questions as you want before moving on."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {INTERVIEWER_ORDER.map((id) => {
          const persona = INTERVIEWERS[id];
          const count = turns.filter((t) => t.interviewer === id).length;
          return (
            <button
              key={id}
              onClick={() => {
                setActive(id);
                setPendingQuestion(null);
              }}
              className={`rounded-md border px-3 py-2 text-left transition-colors ${
                active === id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-neutral-500"
              }`}
            >
              <div className="text-sm font-medium">{persona.name}</div>
              <div className="text-xs text-neutral-500">
                {persona.mode}
                {count > 0 ? ` · ${count} answered` : ""}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {activeTurns.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeTurns.map((t, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4">
                <div className="text-sm text-accent mb-1">{t.question}</div>
                <div className="text-sm text-neutral-300">{t.answer}</div>
              </div>
            ))}
          </div>
        )}

        {!pendingQuestion && (
          <Button onClick={askNext} disabled={loading}>
            {loading ? "Thinking..." : activeTurns.length ? "Ask another question" : `Start with ${INTERVIEWERS[active].name}`}
          </Button>
        )}

        {pendingQuestion && (
          <div className="bg-surface border border-accent/50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-accent">{pendingQuestion}</div>
            <Textarea
              rows={4}
              autoFocus
              placeholder="Your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={submitAnswer} disabled={!answer.trim()}>
                Submit answer
              </Button>
              <Button variant="secondary" onClick={() => setPendingQuestion(null)}>
                Skip question
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-neutral-500">{turns.length} total answers across the panel</span>
          <Button onClick={onNext} disabled={turns.length === 0}>
            Done interviewing — continue
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
