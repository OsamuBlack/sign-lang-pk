import { generateObject } from "ai";

import { google } from "@ai-sdk/google";

import { toGlossSchema } from "@/lib/translationSchema";
import { outliers } from "@/lib/outliers";
import { clientConfig, serverConfig } from "@/config";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";

export const maxDuration = 50; // Allow streaming responses up to 30 seconds

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

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing Google Generative AI API key" }),
      { status: 500 }
    );
  }

  const system = `You are an expert in British Sign Language (BSL) glossing. Your task is to convert English sentences into BSL gloss, following a specific, consistent, and concise style. Adhere strictly to these rules:
  
Pronouns/Indexing:

Negation: use DON'T-LIKE, NOT, or NO

Conciseness: Prioritize direct BSL signs over lengthy descriptive glosses or English idioms. Avoid explicit CL: notation for classifiers; instead, use a single, descriptive gloss for the action/concept.

Compounds: Use a single gloss for single BSL signs, even if the English word is a compound (e.g., BOOKSTORE for "bookstore," PARENTS for "parents"). Do not use + to join words.

Repetition: Do not use +++ or ++ to indicate repetition or continuous action. If repetition is implied, keep the sign singular.

Fingerspelling: The output will handle fingerspelling automatically, so you do not need to add FINGERSPELL- or fs- before words. Just write the word in ALL CAPS (e.g., BARBARA).

Examples to follow:

"What is your name?" -> WHAT YOUR NAME

"I'm not sad." -> SAD I NOT

"Yesterday morning, I woke up at 7 o'clock." -> YESTERDAY WAKEUP I MORNING 7 OCLOCK

"Tell me how you feel." -> YOU FEEL HOW TELL I

"Yesterday at work a stranger rushed past me" -> YESTERDAY WORK STRANGER RUSH PAST I

"My parents have been married for eighteen years." -> MARRIED MY PARENTS EIGHTEEN YEAR

"It's easy." -> EASY

"I like dogs." -> DOGS I LIKE

"She is a teacher." -> SHE TEACHER SHE

"The cat looks up at the bird." -> BIRD CAT LOOK-UP CAT

The result will be given in json format with key/value pairs of sentences and their corresponding BSL glosses.

*Considerations:*
- Text might have page numbers, which you should ignore.
- Text might have footnotes, which you should ignore.
- Text might have references to other works, which you should ignore.
- Text might have formatting like bold or italics, which you should ignore.
- Text might have punctuation, which you should ignore.

*Rules*:
- Follow the [time] [topic] [comment] structure.
- Drop all "a", "an", and "the" — not used in BSL.
- Stem verbs to their base form (e.g., "running" becomes "run").
- Avoid tense verbs; use time adverbs instead: YESTERDAY, TOMORROW, NOW, etc.

*Important*:
**Since there is no punctuation, generate sentences in a way that they make sense without punctuation**.

*Variations:*
- The following are words that have multiple signs such as "play (video game)" and "play (sport)". You will give the gloss with the context in parentheses, like this: PLAY (VIDEO GAME). Do not use the word "play" alone without context. Only use words from the following list:
  ${outliers.join(", ")}`;

  const result = await generateObject({
    model: google("gemini-2.0-flash-lite"),
    system,
    prompt: prompt,
    schema: toGlossSchema,
  });

  await adminDb.collection("translations").add({
    inputText: prompt,
    result: result.object,
    time: new Date(),
  });

  return Response.json(result.object);
}
