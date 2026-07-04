import { NextRequest, NextResponse } from "next/server";
import { reviewDraftWithCouncil } from "@/lib/pipeline";

export async function POST(req: NextRequest) {
  const { draft }: { draft: string } = await req.json();
  if (!draft) return NextResponse.json({ error: "draft is required" }, { status: 400 });

  try {
    const reviews = await reviewDraftWithCouncil(draft);
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
