import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTokens } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { clientConfig, serverConfig } from "@/config";
import {
  timeGlossEdges,
  timeGlossNodes,
  timeGrammerEdges,
  timeGrammerNodes,
} from "@/lib/examples";
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

    const prompt = `
      You are an expert translator between English and sign language. 

      I will provide a text and you need to return a JSON object with the following fields:

      Before returning make sure to return a response similar to following:

      GrammerNode[]
      ${JSON.stringify(timeGrammerNodes)}

      GrammerEdge[]
      ${JSON.stringify(timeGrammerEdges)}

      SignNode[]
      ${JSON.stringify(timeGlossNodes)}
    
      SignEdge[]
      ${JSON.stringify(timeGlossEdges)}

      ${
        reversed
          ? `- translatedText: Simple english grammar for the gloss. "ICE-CREAM I LIKE I" -> "I like Ice-Cream"`
          : `- translatedText: A gloss translation of the text into the target sign language. e.g. "I like Ice-Cream" -> "ICE-CREAM I LIKE I"`
      }
      - grammerNodes: An array of objects representing the syntax tree of the **original english** text.
        Each object should have the following structure:
          type SentenceLevel = "sentence";

          type ClauseLevel =
            | "clause"
            | "independentClause"
            | "dependentClause"
            | "relativeClause"
            | "subordinateClause";

          type PhraseLevel =
            | "phrase"
            | "nounPhrase"
            | "verbPhrase"
            | "adjectivePhrase"
            | "adverbPhrase"
            | "prepPhrase"
            | "gerundPhrase"
            | "infinitivePhrase"
            | "participlePhrase";

          type WordLevel =
            | "word"
            | "noun"
            | "pronoun"
            | "verb"
            | "auxiliaryVerb"
            | "modalVerb"
            | "adjective"
            | "adverb"
            | "preposition"
            | "conjunction"
            | "coordinatingConjunction"
            | "subordinatingConjunction"
            | "correlativeConjunction"
            | "determiner"
            | "interjection"
            | "particle";

          type NodeType = SentenceLevel | ClauseLevel | PhraseLevel | WordLevel;

          interface GrammarNode {
            id: string;
            type: NodeType;
            data: {
              label: string;
              fullForm?: string;
              isWord?: boolean; // (leaf nodes)
            };
            position: {
              x: number;
              y: number;
            };
          }

      - grammerEdges: An array of objects representing the connections of the syntax tree, each object should have the form:
        - id: a unique string
        - source: a string with the id of a node
        - target: a string with the id of a node

      - signNodes: An array of objects representing the syntax tree of the **translated gloss sign language** text. 
        Each object should have the following structure:
          // Sentence level (full signed thought)
          export type SentenceLevel = "signedSentence";

          // Clause level (independent/dependent clauses)
          export type ClauseLevel =
            | "signedClause"
            | "independentClause"
            | "dependentClause"
            | "conditionalClause"
            | "relativeClause";

          // Phrase level (structural groups)
          export type PhraseLevel =
            | "signedPhrase"
            | "topicPhrase" // For topic-comment structure
            | "commentPhrase"
            | "nounPhrase"
            | "verbPhrase"
            | "adjectivePhrase"
            | "adverbPhrase"
            | "prepositionalPhrase"
            | "classifierPhrase"; // Used for shape/movement representation

          // Word level (individual signs in gloss format)
          export type WordLevel =
            | "signedWord"
            | "topic"
            | "comment"
            | "noun"
            | "pronoun"
            | "verb"
            | "adjective"
            | "adverb"
            | "preposition"
            | "conjunction"
            | "determiner"
            | "classifier";

          // All node types combined
          export type GlossNodeType =
            | SentenceLevel
            | ClauseLevel
            | PhraseLevel
            | WordLevel;

          // Sign Language Gloss Node
          export interface GlossNode {
            id: string;
            type: GlossNodeType;
            data: {
              label: string; 
              fullForm?: string; 
              isManual?: boolean // (leaf nodes);
            };
            position: {
              x: number;
              y: number;
            };
          }

      - signEdges: An array of objects representing the connections of the sign language syntax tree, each object should have the form:
        - id: a unique string
        - source: a string with the id of a node
        - target: a string with the id of a node

      Return ONLY the JSON string.  Do not include any other text or explanations.
      
      Make sure to only use the types provided in the prompt.

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
