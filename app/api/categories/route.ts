import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/config";
import { db } from "@/drizzle/db";

export async function GET(req: NextRequest) {
  // Get all books
  const tokens = await getTokens(req.cookies, {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
  });
  if (!tokens) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const cats = await db.query.categories.findMany();
  return NextResponse.json(cats);
}

