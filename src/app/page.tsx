"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VoiceStep } from "@/components/steps/VoiceStep";
import { IdeaStep } from "@/components/steps/IdeaStep";
import { ResearchStep } from "@/components/steps/ResearchStep";
import { InterviewStep } from "@/components/steps/InterviewStep";
import { RawFileStep } from "@/components/steps/RawFileStep";
import { DraftStep } from "@/components/steps/DraftStep";
import { CouncilStep } from "@/components/steps/CouncilStep";
import { RevisionStep } from "@/components/steps/RevisionStep";
import { newProject, Project } from "@/lib/types";

const STORAGE_KEY = "content-machine-project-id";

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const existingId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (existingId) {
        const res = await fetch(`/api/projects/${existingId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          setReady(true);
          return;
        }
      }
      const res = await fetch("/api/projects", { method: "POST", body: JSON.stringify({}) });
      const data = await res.json();
      setProject(data.project);
      localStorage.setItem(STORAGE_KEY, data.project.id);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!project) return;
    fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    }).catch(() => {});
  }, [project]);

  if (!ready || !project) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-neutral-500 text-sm">Loading your content machine...</main>
    );
  }

  function update(patch: Partial<Project>) {
    setProject((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function startOver() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  const researchText = project.research.map((r) => r.content).join("\n\n");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div className="text-sm text-neutral-500 tracking-wide">CONTENT MACHINE</div>
        <button onClick={startOver} className="text-xs text-neutral-600 hover:text-neutral-300">
          Start a new project
        </button>
      </div>

      {step === 1 && (
        <VoiceStep voice={project.voice} onChange={(v) => update({ voice: v })} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <IdeaStep idea={project.idea} onChange={(v) => update({ idea: v })} onNext={() => setStep(3)} />
      )}

      {step === 3 && project.idea && (
        <ResearchStep
          idea={project.idea.idea}
          research={project.research}
          onChange={(r) => update({ research: r })}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && project.idea && (
        <InterviewStep
          idea={project.idea.idea}
          research={researchText}
          turns={project.interview}
          onChange={(t) => update({ interview: t })}
          onNext={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <RawFileStep
          idea={project.idea}
          voice={project.voice}
          research={project.research}
          interview={project.interview}
          rawFile={project.rawFile}
          onChange={(rf) => update({ rawFile: rf })}
          onNext={() => setStep(6)}
        />
      )}

      {step === 6 && project.rawFile && (
        <DraftStep
          rawFile={project.rawFile}
          styleSummary={project.voice?.styleSummary}
          format={project.format}
          draft={project.draft}
          onFormatChange={(f) => update({ format: f })}
          onDraftChange={(d) => update({ draft: d })}
          onNext={() => setStep(7)}
        />
      )}

      {step === 7 && project.draft && (
        <CouncilStep
          draft={project.draft}
          reviews={project.reviews}
          onChange={(r) => update({ reviews: r })}
          onNext={() => setStep(8)}
        />
      )}

      {step === 8 && project.draft && project.rawFile && (
        <RevisionStep
          rawFile={project.rawFile}
          draft={project.draft}
          reviews={project.reviews}
          revisions={project.revisions}
          onDraftChange={(d) => update({ draft: d })}
          onReviewsChange={(r) => update({ reviews: r })}
          onRevisionsChange={(r) => update({ revisions: r })}
          onFinish={() => setStep(9)}
        />
      )}

      {step === 9 && project.draft && (
        <div>
          <div className="text-xs tracking-widest uppercase text-accent mb-3">Done</div>
          <h1 className="font-serif text-3xl mb-6">Your piece is ready</h1>
          <pre className="whitespace-pre-wrap text-sm bg-surface border border-border rounded-lg p-5 font-sans mb-6">
            {project.draft}
          </pre>
          <div className="flex gap-3">
            <Button
              onClick={() => navigator.clipboard.writeText(project.draft ?? "")}
              variant="secondary"
            >
              Copy to clipboard
            </Button>
            <Button onClick={() => setStep(8)} variant="secondary">
              Back to revisions
            </Button>
            <Button onClick={startOver}>Start a new project</Button>
          </div>
        </div>
      )}

      {step > 1 && step < 9 && (
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="mt-8 text-xs text-neutral-600 hover:text-neutral-300"
        >
          ← Back
        </button>
      )}
    </main>
  );
}
