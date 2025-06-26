import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/config";

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
  const booksSnap = await adminDb.collection("books").get();
  const books = booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  // Create a new book
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
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const ref = await adminDb.collection("books").add({ name });
  return NextResponse.json({ id: ref.id, name });
}
