import { NextRequest, NextResponse } from "next/server";
import { reviseDraft } from "@/lib/pipeline";
import { CouncilReview } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { draft, reviews, rawFile }: { draft: string; reviews: CouncilReview[]; rawFile: string } =
    await req.json();

  if (!draft || !reviews?.length) {
    return NextResponse.json({ error: "draft and reviews are required" }, { status: 400 });
  }

  try {
    const result = await reviseDraft(draft, reviews, rawFile);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
