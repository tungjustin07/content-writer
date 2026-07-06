import { promises as fs } from "fs";
import path from "path";
import crypto from "node:crypto";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { v4 as uuidv4 } from "uuid";

import { compileRawFile } from "../src/lib/compile";
import { FORMAT_SPEC } from "../src/lib/formats";
import { INTERVIEWER_ORDER } from "../src/lib/personas";
import { perplexityEnabled, researchWithPerplexity } from "../src/lib/perplexity";
import {
  generateStyleGuide,
  getNextInterviewQuestion,
  reviewDraftWithCouncil,
  reviseDraft,
  writeDraft,
} from "../src/lib/pipeline";
import { saveProject } from "../src/lib/storage";
import { ContentFormat, CouncilReview, IdeaInput, InterviewTurn, newProject } from "../src/lib/types";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // no .env.local present — env vars must already be set in the shell
}

const MAX_ITERATIONS_DEFAULT = 5;
const VOICE_DIR = path.join(process.cwd(), "data", "inputs", "voice");
const STYLE_GUIDE_PATH = path.join(VOICE_DIR, "style-guide.md");
const STYLE_HASH_PATH = path.join(VOICE_DIR, "style-guide.hash");
const DIAGNOSTIC_ANSWERS_PATH = path.join(VOICE_DIR, "diagnostic-answers.json");

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function hashOf(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function loadVoiceSamples(): Promise<string> {
  const files = await fs.readdir(VOICE_DIR).catch(() => [] as string[]);
  const sampleFiles = files.filter((f) => f.endsWith(".md") && f !== "style-guide.md");
  const contents = await Promise.all(sampleFiles.map((f) => fs.readFile(path.join(VOICE_DIR, f), "utf-8")));
  return contents.join("\n\n");
}

async function loadDiagnosticAnswers(): Promise<Record<string, string>> {
  const raw = await fs.readFile(DIAGNOSTIC_ANSWERS_PATH, "utf-8").catch(() => null);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    console.log(`Could not parse ${DIAGNOSTIC_ANSWERS_PATH} as JSON — ignoring it.`);
    return {};
  }
}

async function getStyleGuide(regen: boolean): Promise<string> {
  const samples = await loadVoiceSamples();
  const diagnosticAnswers = await loadDiagnosticAnswers();
  if (!samples.trim() && Object.keys(diagnosticAnswers).length === 0) {
    console.log("No voice sample files or diagnostic answers found in data/inputs/voice/ — skipping voice tuning.");
    return "";
  }
  const hash = hashOf(samples + JSON.stringify(diagnosticAnswers));
  if (!regen) {
    const cachedHash = await fs.readFile(STYLE_HASH_PATH, "utf-8").catch(() => null);
    if (cachedHash === hash) {
      const cached = await fs.readFile(STYLE_GUIDE_PATH, "utf-8").catch(() => null);
      if (cached) {
        console.log("Using cached style guide (inputs unchanged — pass --regen-voice to force a rebuild).");
        return cached;
      }
    }
  }
  console.log(
    `Generating style guide from ${samples.length.toLocaleString()} chars of writing samples and ${
      Object.keys(diagnosticAnswers).length
    } diagnostic answer(s)...`
  );
  const styleSummary = await generateStyleGuide(samples, diagnosticAnswers);
  await fs.mkdir(VOICE_DIR, { recursive: true });
  await fs.writeFile(STYLE_GUIDE_PATH, styleSummary, "utf-8");
  await fs.writeFile(STYLE_HASH_PATH, hash, "utf-8");
  return styleSummary;
}

function scoreLine(reviews: CouncilReview[]): string {
  return reviews.map((r) => `  ${r.member}: ${r.score}/10 — ${r.feedback}`).join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env.local first.");
    process.exit(1);
  }

  const format = (typeof args.format === "string" ? args.format : "linkedin_post") as ContentFormat;
  if (!FORMAT_SPEC[format]) {
    console.error(`Unknown format "${format}". Valid formats: ${Object.keys(FORMAT_SPEC).join(", ")}`);
    process.exit(1);
  }
  const maxRevisions = Number(args["max-revisions"] ?? MAX_ITERATIONS_DEFAULT);
  const skipInterview = !!args["skip-interview"];
  const regenVoice = !!args["regen-voice"];
  const origin = (typeof args.origin === "string" ? args.origin : "own_idea") as IdeaInput["origin"];

  if (args["voice-only"]) {
    console.log("=== Step 1: Voice ===");
    const styleSummary = await getStyleGuide(regenVoice);
    if (styleSummary) console.log("\n" + styleSummary + "\n");
    return;
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });

  let topic = typeof args.topic === "string" ? args.topic : "";
  if (!topic) {
    topic = await rl.question("What do you want to write about? ");
  }
  if (!topic.trim()) {
    console.error("A topic is required (--topic \"...\").");
    process.exit(1);
  }

  const project = newProject(uuidv4());
  project.title = topic.slice(0, 80);
  project.format = format;
  project.idea = { idea: topic, origin };
  await saveProject(project);
  console.log(`\nProject ${project.id} created.\n`);

  console.log("=== Step 1: Voice ===");
  const styleSummary = await getStyleGuide(regenVoice);
  if (styleSummary) {
    project.voice = {
      writingSamples: "(loaded from data/inputs/voice/*.md)",
      diagnosticAnswers: {},
      styleSummary,
    };
    await saveProject(project);
    console.log("\n" + styleSummary + "\n");
  }

  console.log("=== Step 3: Research ===");
  let researchNote = "";
  if (typeof args["research-file"] === "string") {
    researchNote = await fs.readFile(args["research-file"], "utf-8");
    project.research.push({ source: "manual", content: researchNote });
  } else if (typeof args.research === "string") {
    researchNote = args.research;
    project.research.push({ source: "manual", content: researchNote });
  } else if (perplexityEnabled()) {
    console.log("Querying Perplexity...");
    try {
      researchNote = await researchWithPerplexity(
        `I'm writing about: "${topic}". Find supporting stats, data points, and the strongest counterarguments or objections a skeptical reader would raise.`
      );
      project.research.push({ source: "perplexity", content: researchNote });
      console.log("\n" + researchNote + "\n");
    } catch (err) {
      console.log(`Perplexity research failed, continuing without it: ${(err as Error).message}`);
    }
  } else {
    console.log("No PERPLEXITY_API_KEY set and no --research provided — skipping.");
  }
  await saveProject(project);

  console.log("\n=== Step 4: Interview panel ===");
  const turns: InterviewTurn[] = [];
  if (skipInterview) {
    console.log("Skipped (--skip-interview).");
  } else {
    for (const interviewer of INTERVIEWER_ORDER) {
      const question = await getNextInterviewQuestion(interviewer, topic, researchNote || undefined, turns);
      console.log(`\n[${interviewer}] ${question}`);
      const answer = await rl.question("> ");
      turns.push({ interviewer, question, answer });
      project.interview = turns;
      await saveProject(project);
    }
  }

  console.log("\n=== Step 5: Compiling raw file ===");
  const rawFile = compileRawFile({
    idea: project.idea,
    voice: project.voice,
    research: project.research,
    interview: project.interview,
  });
  project.rawFile = rawFile;
  await saveProject(project);
  console.log(`Raw file compiled (${rawFile.length} chars).`);

  console.log(`\n=== Step 6: Drafting (${format}) ===`);
  let draft = await writeDraft(rawFile, format, styleSummary || undefined);
  project.draft = draft;
  await saveProject(project);
  console.log("\n" + draft + "\n");

  console.log("=== Step 7: Writer's council ===");
  let reviews = await reviewDraftWithCouncil(draft);
  project.reviews = reviews;
  await saveProject(project);
  console.log(scoreLine(reviews));

  let iteration = 0;
  while (iteration < maxRevisions && reviews.some((r) => r.score < 9)) {
    iteration++;
    console.log(`\n=== Step 8: Revision ${iteration} ===`);
    const result = await reviseDraft(draft, reviews, rawFile);
    draft = result.draft;
    reviews = await reviewDraftWithCouncil(draft);
    project.revisions.push({ iteration, changesSummary: result.changesSummary, draft, reviews });
    project.draft = draft;
    project.reviews = reviews;
    await saveProject(project);
    console.log("Changes: " + result.changesSummary);
    console.log("\n" + draft + "\n");
    console.log(scoreLine(reviews));
  }

  const finalPath = path.join(process.cwd(), "data", "projects", `${project.id}.final.md`);
  await fs.writeFile(finalPath, draft, "utf-8");

  console.log(`\nDone after ${iteration} revision(s). Final draft: ${finalPath}`);
  console.log(`Full project state: data/projects/${project.id}.json`);
  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
