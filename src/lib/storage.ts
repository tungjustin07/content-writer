import { promises as fs } from "fs";
import path from "path";
import { Project } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "data", "projects");

async function ensureDir() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
}

function projectPath(id: string) {
  return path.join(PROJECTS_DIR, `${id}.json`);
}

export async function saveProject(project: Project): Promise<void> {
  await ensureDir();
  project.updatedAt = new Date().toISOString();
  await fs.writeFile(projectPath(project.id), JSON.stringify(project, null, 2), "utf-8");
}

export async function loadProject(id: string): Promise<Project | null> {
  try {
    const raw = await fs.readFile(projectPath(id), "utf-8");
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<Project[]> {
  await ensureDir();
  const files = await fs.readdir(PROJECTS_DIR);
  const projects: Project[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = await fs.readFile(path.join(PROJECTS_DIR, file), "utf-8");
    projects.push(JSON.parse(raw));
  }
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await fs.unlink(projectPath(id));
  } catch {
    // already gone
  }
}

/**
 * Past feedback the draft step loads before writing — pulled from the lowest-scoring
 * council notes across previously completed projects, so recurring notes compound over time.
 */
export async function pastFeedbackDigest(): Promise<string> {
  const projects = await listProjects();
  const notes: string[] = [];
  for (const p of projects) {
    for (const rev of p.revisions) {
      for (const review of rev.reviews) {
        if (review.score < 9) notes.push(`- (${review.member}) ${review.feedback}`);
      }
    }
  }
  return notes.slice(0, 20).join("\n");
}
