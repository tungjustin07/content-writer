import { NextRequest, NextResponse } from "next/server";
import { writeDraft } from "@/lib/pipeline";
import { ContentFormat } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { rawFile, format, styleSummary }: { rawFile: string; format: ContentFormat; styleSummary?: string } =
    await req.json();

  if (!rawFile) return NextResponse.json({ error: "rawFile is required" }, { status: 400 });

  try {
    const draft = await writeDraft(rawFile, format, styleSummary);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
