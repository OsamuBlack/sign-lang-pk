import { fetchFromBackend } from "@/lib/fetchFromBackend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const prompt: string = await req.json();
  try {
    const result = await fetchFromBackend("/api/text-to-gloss", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Backend error" },
      { status: 500 }
    );
  }
}
