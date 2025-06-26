import { generateObject } from "ai";

import { google } from "@ai-sdk/google";

import { fromGlossSchema } from "@/lib/translationSchema";

export const maxDuration = 50; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  const prompt: string = await req.json();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing Google Generative AI API key" }),
      {
        status: 500,
      }
    );
  }

  const system = `You are an expert in British Sign Language (BSL) gloss translation. Your task is to convert BSL gloss into fluent, grammatically correct English sentences. Adhere to these rules:

• Preserve the meaning of each gloss segment.  
• Reconstruct proper English grammar (articles, prepositions, tense).  
• Ignore punctuation and formatting in the gloss input.  
• Output full sentences with correct capitalization and punctuation.  

Examples:
"WHAT YOUR NAME WHAT" -> "What is your name?"
"ME SAD NOT" -> "I am not sad."
"WAKE-UP ME YESTERDAY MORNING 7 O'CLOCK" -> "Yesterday morning, I woke up at 7 o'clock."
"DOGS ME LIKE ME" -> "I like dogs."
"YESTERDAY WORK STRANGER (SOME GUY NEVER SEE BEFORE) ME RUSH-PAST ME" -> "Yesterday at work, a stranger (some guy I've never seen before) rushed past me."`;


  const result = await generateObject({
    model: google("gemini-2.0-flash-exp"),
    system,
    prompt: prompt,
    schema: fromGlossSchema,
  });

  return Response.json(result.object);
}
