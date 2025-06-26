import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import { words } from "@/drizzle/schema";
import { mapGlossToVideos } from "@/lib/mapGlossToVideos";
import { clientConfig, serverConfig } from "@/config";
import { getTokens } from "next-firebase-auth-edge";
import { adminDb } from "@/firebase/admin";

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

  const wordsArr: string[] = gloss.split(/\s+(?!\()/).filter(Boolean);

  // Split hyphenated words and remove punctuation
  const cleanedWords = wordsArr.map((word) =>
    word.toLowerCase().replace("-", " ")
  );

  // Get unique words
  const uniqueWords = Array.from(new Set(cleanedWords));

  // Get list of words that are in the database
  const wordsWithVideos = await db.transaction(async (tx) => {
    const results = await Promise.all(
      uniqueWords.map((w) =>
        tx.query.words.findMany({
          where: and(eq(words.word, w), eq(words.isAlphabet, false)),
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
              },
            },
          },
        })
      )
    );
    return results.flat();
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
        },
      },
    },
  });

  // Map gloss to array for video player
  const videoArray = mapGlossToVideos(gloss, wordsWithVideos, alphabets);

  await adminDb.collection("maps").add({
    inputText: gloss,
    result: videoArray,
    time: new Date(),
  });

  return NextResponse.json({ videos: videoArray });
}
