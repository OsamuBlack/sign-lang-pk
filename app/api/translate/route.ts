import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { clientConfig, serverConfig } from "@/config";
import { adminDb } from "@/firebase/admin";


export const config = {
  runtime: "edge",
};

const MODEL_NAME = "gemini-2.0-flash";
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

    const prompt = `You are an expert translator between English and sign language. 

You are an expert in Pakistan Sign Language (PSL) glossing. Your task is to convert English sentences into PSL gloss, following a specific, consistent, and concise style. Adhere strictly to these rules:

Pronouns/Indexing:

Negation: use DON'T-LIKE, NOT, or NO

Conciseness: Prioritize direct PSL signs over lengthy descriptive glosses or English idioms. Avoid explicit CL: notation for classifiers; instead, use a single, descriptive gloss for the action/concept.

Compounds: Use a single gloss for single PSL signs, even if the English word is a compound (e.g., BOOKSTORE for "bookstore," PARENTS for "parents"). Do not use + to join words.

Repetition: Do not use +++ or ++ to indicate repetition or continuous action. If repetition is implied, keep the sign singular.

Punctuation: End sentences with a period . or question mark ? as appropriate.

Fingerspelling: Indicate fingerspelling with FINGERSPELL- followed by the word in ALL CAPS (e.g.,  fs-B-A-R-B-A-R-A).

Examples to follow:

"What is your name?" -> WHAT YOUR NAME WHAT?

"I'm not sad." ->I SAD NOT.

"Yesterday morning, I woke up at 7 o'clock." -> YESTERDAY MORNING I WAKE-UP 7 O'CLOCK.

"Tell me how you feel." -> HOW YOU FEEL TELL I.

"Yesterday at work a stranger (some guy I've never seen before) rushed past me." -> YESTERDAY WORK STRANGER (SOME GUY NEVER SEE BEFORE) I RUSH-PAST I.

"My parents have been married for eighteen years." -> PARENTS MINE MARRIED EIGHTEEN YEAR HAVE-BEEN.

"It's easy." -> EASY.

"I like dogs." -> DOGS I LIKE I.

"She is a teacher." -> SHE TEACHER SHE.

"The cat looks up at the bird." -> BIRD CAT LOOK-UP CAT.

Here is the input text: ${text}
    `;

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
