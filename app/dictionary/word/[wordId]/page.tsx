import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { words, videoUrls, wordVideos } from "@/drizzle/schema";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function WordPage({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  const paramsResolved = await params;
  const wordLabel = paramsResolved.wordId;
  // Find word by label (assuming label is unique, e.g., slug or word)
  const word = (await db.select().from(words).where(eq(words.word, wordLabel)))[0];
  if (!word) return notFound();

  // Get video URL via wordVideos join
  const wordVideo = (
    await db.select().from(wordVideos).where(eq(wordVideos.wordId, word.id))
  )[0];
  let videoUrl: string | null = null;
  if (wordVideo && wordVideo.videoId != null) {
    const video = (
      await db
        .select()
        .from(videoUrls)
        .where(eq(videoUrls.id, wordVideo.videoId as number))
    )[0];
    videoUrl = video?.url || null;
  }

  // Get recommended/next words in the same category
  const recommended = word.categoryId
    ? (
        await db
          .select()
          .from(words)
          .where(eq(words.categoryId, word.categoryId))
      )
        .filter((w) => w.word !== wordLabel)
        .slice(0, 6)
    : [];

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-8 flex flex-col gap-8">
      <div className="">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {word.word.toUpperCase()}
        </h1>
        <p className="mb-4 text-muted-foreground text-lg">{word.definition}</p>
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full rounded shadow" />
        ) : (
          <div className="text-red-500">No video available for this word.</div>
        )}
      </div>
      {recommended.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-2 text-primary">Next Videos</h3>
          <div className="flex flex-wrap gap-4">
            {recommended.map((w) => (
              <Link
                key={w.id}
                href={`/dictionary/word/${w.word}`}
                className="bg-muted rounded-lg px-4 py-2 shadow hover:bg-accent transition-colors text-primary font-medium"
              >
                {w.word.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// export async function generateStaticParams() {
//   // Fetch all word labels for static generation
//   const allWords = await db.select().from(words);
//   return allWords.map((w) => ({ wordId: w.word }));
// }
