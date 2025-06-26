import { generateObject } from "ai";

import { google } from "@ai-sdk/google";

import { toGlossSchema } from "@/lib/translationSchema";

export const maxDuration = 50; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
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
  
  "What is your name?" -> WHAT YOUR NAME WHAT
  
  "I'm not sad." ->ME SAD NOT
  
  "Yesterday morning, I woke up at 7 o'clock." -> WAKE-UP ME YESTERDAY MORNING 7 O'CLOCK
  
  "Tell me how you feel." -> YOU FEEL HOW TELL ME
  
  "Yesterday at work a stranger (some guy I've never seen before) rushed past me" -> YESTERDAY WORK STRANGER (SOME GUY NEVER SEE BEFORE) ME RUSH-PAST ME
  
  "My parents have been married for eighteen years." -> MARRIED MY PARENTS EIGHTEEN YEAR
  
  "It's easy." -> EASY
  
  "I like dogs." -> DOGS ME LIKE ME
  
  "She is a teacher." -> SHE TEACHER SHE
  
  "The cat looks up at the bird." -> BIRD CAT LOOK-UP CAT
  
  The result will be given in json format with keyvalue pairs of sentences and their corresponding BSL glosses.
  
  *Considerations:*
  - Text might have page numbers, which you should ignore.
  - Text might have footnotes, which you should ignore.
  - Text might have references to other works, which you should ignore.
  - Text might have formatting like bold or italics, which you should ignore.
  - Text might have punctuation, which you should ignore.
  `;

  const result = await generateObject({
    model: google("gemini-2.0-flash-exp"),
    system,
    prompt: prompt,
    schema: toGlossSchema,

  });

  return Response.json(result.object);
}
