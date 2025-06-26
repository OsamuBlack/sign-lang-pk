import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { clientConfig, serverConfig } from "@/config";

import { adminDb } from "@/firebase/admin";

const MODEL_NAME = "gemini-2.0-flash-lite";
const apiKey = process.env.GEMINI_ENDPOINT;
const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
});

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

  try {
    const { text, reversed } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const prompt = ``;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    const trimmedResponse = textResponse.trim();
    const cleanedResponse = trimmedResponse
      .replace(/^`*json\n*/, "")
      .replace(/\n`*$/, ""); // Removes ```json and ```

    try {
      const parsedResponse = JSON.parse(cleanedResponse);

      // Save response to firebase collection named gemini and also include reverse and inputText
      try {
        await adminDb.collection("gemini").add({
          reverse: reversed,
          inputText: text,
          text: parsedResponse,
          time: new Date(),
          prompt,
        });
      } catch (dbError) {
        console.error("Error saving to Firestore:", dbError);
      }
      return NextResponse.json(parsedResponse);
    } catch (error) {
      console.error("Error parsing Gemini response:", error, cleanedResponse);
      return NextResponse.json(
        {
          error: "Failed to parse Gemini response as JSON",
          // Consider removing geminiResponse in production for security reasons
          // geminiResponse: textResponse,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/translate:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
