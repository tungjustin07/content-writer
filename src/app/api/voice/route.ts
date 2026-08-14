import { NextRequest, NextResponse } from "next/server";
import { generateStyleGuide } from "@/lib/pipeline";

export async function POST(req: NextRequest) {
  const { writingSamples, diagnosticAnswers } = await req.json();

  try {
    const styleSummary = await generateStyleGuide(writingSamples, diagnosticAnswers ?? {});
    return NextResponse.json({ styleSummary });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
