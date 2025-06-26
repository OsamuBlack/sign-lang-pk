import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { eq, and, inArray } from "drizzle-orm";
import { words } from "@/drizzle/schema";
import { mapGlossToVideos } from "@/lib/mapGlossToVideos";
import { clientConfig, serverConfig } from "@/config";
import { getTokens } from "next-firebase-auth-edge";

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
  const { gloss } = await req.json();
  if (!gloss) {
    return NextResponse.json(
      { error: "Missing gloss in request body" },
      { status: 400 }
    );
  }

  const wordsArr: string[] = gloss.split(/\s+/).filter(Boolean);

  // Clean up gloss words

  // Split hyphenated words and remove punctuation
  const cleanedWords = wordsArr.map((word) => word.toLowerCase().replace('-'," "));

  // Get unique words
  const uniqueWords = Array.from(new Set(cleanedWords));

  console.log("Unique words:", uniqueWords);

  // Get list of words that are in the database
  const wordsWithVideos = await db.query.words.findMany({
    where: and(inArray(words.word, uniqueWords), eq(words.isAlphabet, false)),

    columns: {
      id: true,
      word: true,
    },
    with: {
      wordVideos: {
        with: {
          video: {
            columns: {
              url: true,
              size: true,
            },
          },
        }
      },
    },
  });

  // Alphabets
  const alphabets = await db.query.words.findMany({
    where: eq(words.isAlphabet, true),

    columns: {
      id: true,
      word: true,
    },
    with: {
      wordVideos: {
        with: {
          video: {
            columns: {
              url: true,
              size: true,
            },
          },
        }
      },
    },
  });

  // Map gloss to array for video player
  const videoArray = mapGlossToVideos(gloss, wordsWithVideos, alphabets);

  return NextResponse.json({ videos: videoArray });
}
