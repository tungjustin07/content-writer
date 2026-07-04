import { NextRequest, NextResponse } from "next/server";
import { deleteProject, loadProject, saveProject } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await loadProject(params.id);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await loadProject(params.id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const patch = await req.json();
  const updated = { ...existing, ...patch, id: existing.id };
  await saveProject(updated);
  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteProject(params.id);
  return NextResponse.json({ ok: true });
}
