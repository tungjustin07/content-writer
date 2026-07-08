# End-of-Day Log

---
## [2026-07-08]

### 🏗️ What Was Built / Shipped
No commits landed on the literal 2026-07-08 date boundary (git log for today is empty) — this entry covers the active session/branch `add-style-guide`, all pushed as of yesterday's commits:
- Migrated `content-machine` out of `linkedin-icp-clean` into its own repo, `tungjustin07/content-writer`, first commit direct to `main` (empty-repo special case), everything after via PR.
- Built a headless CLI pipeline (`scripts/run-pipeline.ts`, `npm run pipeline`) running all 8 pipeline steps from the terminal; extracted shared logic into `src/lib/pipeline.ts` so the Next API routes and the CLI use one source of truth.
- Added `--research-file`, `--voice-only`, and `--score`/`--compare` CLI flags (the last one explains *why* council scores changed between two draft versions, not just the delta).
- Built the voice style guide (`docs/style-guide.md`, committed) from 73 real LinkedIn posts, 150 outbound DMs, diagnostic Q&A, and two hand-tuned confirmed posts — refined across ~8 rounds as real feedback came in (short/punchy, flat declarative, no hedging, no em dashes, humor without sarcasm/profanity, personal content must anchor to professional conviction, prefer undercutting a dramatic beat over stating it flatly).
- Drafted and finalized two real posts: an AI-model-capability piece (grounded in real examples after catching and removing a fabricated anecdote/stat) and a Fourth-of-July immigrant-family story (fully sourced from real family facts via Q&A) — both saved locally, one posted.
- Everything is on PR [#1](https://github.com/tungjustin07/content-writer/pull/1), open, not yet merged.

### 🧭 Decisions Made
- CLI shares logic with the web UI via `src/lib/pipeline.ts` rather than duplicating prompts.
- Style guide lives in two places by design: `docs/style-guide.md` (committed, shareable) vs `data/inputs/voice/*` (gitignored — raw personal LinkedIn export data, diagnostic answers, hand-edited samples).
- Never fabricate anecdotes/stats not present in source material — caught a violation of this mid-session and corrected the process (ask-before-drafting became a standing rule).
- Council scoring should be used as a diagnostic (read the per-judge disagreement) not an auto-revise black box.
- Interview panel (6 personas) now runs by default for new topics going forward, with explicit start/end announcements, instead of being skipped in favor of generic fact-finding questions.

### 🚧 Blockers and Failures
✅ None outstanding — one real failure occurred and was caught/fixed mid-session (a draft fabricated a "sales ops lead" anecdote and a 40% stat that weren't in the source notes; rewritten grounded-only afterward).

### 🔮 Open Questions / Tomorrow
- PR #1 is still open — merge whenever ready.
- Two drafts saved locally awaiting action: `data/inputs/drafts/ai-vampire.md` (saved for later, not posted) and the AI-model-capability post (posted per user's own final edit).
- Next real test of the interview-panel-by-default rule is still pending — no topic has gone through it live yet.
- `npm install`, `.env.local` with `ANTHROPIC_API_KEY` (+ optional `PERPLEXITY_API_KEY`) still the standard local setup for anyone new to the repo.

### 📈 Git Stats
- 📝 Commits today (2026-07-08 literal date): 0
- 📁 Files changed (recent history, HEAD~10..HEAD): 12 — `.claude/launch.json`, `.gitignore`, `docs/style-guide.md`, `package-lock.json`, `package.json`, `scripts/run-pipeline.ts`, 5× `src/app/api/*/route.ts`, `src/lib/pipeline.ts`
- 🏷️ Feature areas: feat (CLI pipeline, score/compare, style guide), chore (repo migration, gitignore)

### 💾 Checkpoints Today
None stored for this project (baton DB has no content-writer entries yet)
