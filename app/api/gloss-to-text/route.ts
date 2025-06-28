import { fetchFromBackend } from "@/lib/fetchFromBackend";
import { google } from "@ai-sdk/google";

import { fromGlossSchema } from "@/lib/translationSchema";

export const maxDuration = 50; // Allow streaming responses up to 30 seconds
import { clientConfig, serverConfig } from "@/config";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const tokens = await getTokens(req.cookies, {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
  });

  if (!tokens) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); // 401 Unauthorized is more appropriate
  }
  const prompt: string = await req.json();
  try {
    const result = await fetchFromBackend("/api/gloss-to-text", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Backend error" }, { status: 500 });
  }
}
