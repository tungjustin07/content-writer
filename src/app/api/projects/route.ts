import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { listProjects, saveProject } from "@/lib/storage";
import { newProject } from "@/lib/types";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const project = newProject(uuidv4());
  if (body?.title) project.title = body.title;
  await saveProject(project);
  return NextResponse.json({ project });
}
