import { generateObject } from "ai";

import { google } from "@ai-sdk/google";

import { toGlossSchema } from "@/lib/translationSchema";
import { outliers } from "@/lib/outliers";
import { clientConfig, serverConfig } from "@/config";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getWordsWithVideos, getAlphabets } from "@/lib/wordsWithVideos";
import { mapGlossToVideos } from "@/lib/mapGlossToVideos";

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
  const {
    prompt,
    book,
    document,
  }: {
    prompt: string;
    book: string;
    document: string;
  } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const doc = await adminDb
    .collection("books")
    .doc(book)
    .collection("documents")
    .doc(document)
    .get();
  // Check firebase if document path exists
  if (doc.exists) {
    return NextResponse.json(
      { error: "Document already exists" },
      { status: 400 }
    );
  }

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

"What is your name?" -> WHAT YOUR NAME WHAT

"I'm not sad." -> I SAD NOT

"Yesterday morning, I woke up at 7 o'clock." -> WAKE-UP I YESTERDAY MORNING 7 O'CLOCK

"Tell me how you feel." -> YOU FEEL HOW TELL I

"Yesterday at work a stranger (some guy I've never seen before) rushed past me" -> YESTERDAY WORK STRANGER (SOME GUY NEVER SEE BEFORE) I RUSH-PAST I

"My parents have been married for eighteen years." -> MARRIED MY PARENTS EIGHTEEN YEAR

"It's easy." -> EASY

"I like dogs." -> DOGS I LIKE I

"She is a teacher." -> SHE TEACHER SHE

"The cat looks up at the bird." -> BIRD CAT LOOK-UP CAT

The result will be given in json format with key/value pairs of sentences and their corresponding BSL glosses.

*Considerations:*
- Text might have page numbers, which you should ignore.
- Text might have footnotes, which you should ignore.
- Text might have references to other works, which you should ignore.
- Text might have formatting like bold or italics, which you should ignore.
- Text might have punctuation, which you should ignore.

*Variations:*
- The following are words that have multiple signs such as "play (video game)" and "play (sport)". You will give the gloss with the context in parentheses, like this: PLAY (VIDEO GAME). Do not use the word "play" alone without context. Only use words from the following list:
  ${outliers.join(", ")}`;

  const result = await generateObject({
    model: google("gemini-2.0-flash-lite"),
    system,
    prompt: prompt,
    schema: toGlossSchema,
  });

  // Gather all unique words from all gloss sentences
  const allGlosses = result.object.sentences.map((s) => s.to);
  const wordsArr = allGlosses
    .flatMap((gloss) => gloss.split(/\s+(?!\()/).filter(Boolean))
    .map((word) => word.toLowerCase().replace(/-/g, " "));
  const uniqueWords = Array.from(new Set(wordsArr));

  // Get words with videos and alphabets
  const [wordsWithVideos, alphabets] = await Promise.all([
    getWordsWithVideos(uniqueWords),
    getAlphabets(),
  ]);

  // Remap sentences to include feed
  const sentencesWithFeed = result.object.sentences.map((s) => ({
    ...s,
    feed: mapGlossToVideos(s.to, wordsWithVideos, alphabets).map((v) => ({
      word: v.label,
      url: v.url,
      // Find id for word if available
      id:
        wordsWithVideos.find((w) =>
          w.word.toLowerCase() === v.label.toLowerCase()
        )?.id || null,
    })),
  }));

  const finalObject = { ...result.object, sentences: sentencesWithFeed };

  await adminDb
    .collection("books")
    .doc(book)
    .collection("documents")
    .doc(document)
    .set(finalObject);

  return Response.json(finalObject);
}
