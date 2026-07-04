import { NextRequest, NextResponse } from "next/server";
import { compileRawFile } from "@/lib/compile";

export async function POST(req: NextRequest) {
  const { idea, voice, research, interview } = await req.json();
  const rawFile = compileRawFile({ idea, voice, research: research ?? [], interview: interview ?? [] });
  return NextResponse.json({ rawFile });
}
