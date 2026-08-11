# Content Machine

**Public repository:** [tungjustin07/content-writer](https://github.com/tungjustin07/content-writer)

An 8-step pipeline that interviews you before it writes, so nothing gets fabricated.

Based on the "content machine" workflow: tune your voice, capture the idea, optionally
research it, get interviewed by a 6-persona panel, compile everything into a raw
markdown source-of-truth file, draft it in the right format, get scored by a 6-persona
writer's council, then revise in a loop until every score is ≥ 9/10.

```bash
git clone https://github.com/tungjustin07/content-writer.git
cd content-writer
```

## The 8 steps

1. **Tune your voice** (optional) — paste writing samples, answer 5 diagnostic
   questions, get a reusable style guide.
2. **The idea** — what you want to write about, and where it came from.
3. **Research agent** (optional) — pulls stats/data/counterarguments via Perplexity
   if `PERPLEXITY_API_KEY` is set; otherwise paste your own notes.
4. **The interview panel** — six personas (Tim Ferriss, Joe Rogan, Larry King, Howard
   Stern, Michael Barbaro, Barbara Walters) each ask questions in their own style.
   The machine only asks; you do the talking.
5. **The raw file** — everything so far is compiled, deterministically (no LLM), into
   one markdown file. This is the only source of facts the draft step is allowed to use.
6. **The draft** — pick a format (LinkedIn post, X thread, long essay, playbook,
   podcast promo, video clip) and generate a first draft from the raw file, style
   guide, and feedback patterns from past projects.
7. **The writer's council** — six reviewers (Morgan Housel, Tim Urban, Shaan Puri,
   Greg Isenberg, David Perell, The Slop Detector) each score the draft out of 10 on
   their own focus.
8. **The revision loop** — any score below 9 triggers a targeted revision (lowest
   score fixed first), then a re-review. Repeats (up to 5 iterations) until every
   score clears 9, logging what changed at each step.

## Setup

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (required), PERPLEXITY_API_KEY (optional)
npm run dev
```

Open http://localhost:3000. Projects persist to `data/projects/*.json` (gitignored) so
you can close the tab and resume — the browser remembers your project id in
`localStorage`.

**Public repo note:** never commit `.env.local` or anything under `data/`. Those paths
are gitignored so local drafts and API keys stay off GitHub.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Anthropic SDK (Claude) for the voice profile, interview questions, drafting, and
  council scoring
- Perplexity API (optional) for live research
- Filesystem JSON persistence, no database

## Notes

- The raw-file compile step (5) never calls an LLM — it's a pure formatting pass, so
  the draft step can't fabricate facts beyond what's actually in it.
- Past council feedback scoring below 9 across previous projects is fed back into the
  next draft's prompt, so recurring notes compound over time.
- The revision loop is capped at 5 iterations as a safety valve.
