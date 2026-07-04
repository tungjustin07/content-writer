import { NextRequest, NextResponse } from "next/server";
import { perplexityEnabled, researchWithPerplexity } from "@/lib/perplexity";

export async function GET() {
  return NextResponse.json({ enabled: perplexityEnabled() });
}

export async function POST(req: NextRequest) {
  const { idea } = await req.json();
  if (!perplexityEnabled()) {
    return NextResponse.json(
      { error: "PERPLEXITY_API_KEY is not set. Add your own research notes instead." },
      { status: 400 }
    );
  }
  try {
    const query = `I'm writing about: "${idea}". Find supporting stats, data points, and the strongest counterarguments or objections a skeptical reader would raise.`;
    const content = await researchWithPerplexity(query);
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
