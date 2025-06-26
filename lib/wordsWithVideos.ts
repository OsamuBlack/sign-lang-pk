import { db } from "@/drizzle/db";
import { words } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function getWordsWithVideos(uniqueWords: string[]) {
  // For each unique word, get the word and its videos (not alphabets)
  const results = await Promise.all(
    uniqueWords.map((w) =>
      db.query.words.findMany({
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
}

export async function getAlphabets() {
  return db.query.words.findMany({
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
}
