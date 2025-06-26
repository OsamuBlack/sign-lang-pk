import { db } from "@/drizzle/db";
import { words, videoUrls, wordVideos, categories } from "@/drizzle/schema";
import fs from "fs/promises";
import { slug } from "./lib/slug";

const BATCH_SIZE = 100;

async function insertWordsFromFile() {
  const raw = await fs.readFile("../json/all_video_sources.json", "utf-8");
  const categoriesRaw = await fs.readFile(
    "../json/psl_categories.json",
    "utf-8"
  );

  const data: {
    item: string;
    category: string;
    url: string;
    video_sources?: { url: string; size: number; type?: string }[];
  }[] = JSON.parse(raw);
  const categoriesData: [string, string][] = JSON.parse(categoriesRaw);

  const allowedSizes = [240, 360, 480, 720];

  console.log("Inserting categories...");
  await db.transaction(async (tx) => {
    for (const [id, name] of categoriesData) {
      await tx
        .insert(categories)
        .values({ id: Number(id), name,
          slug: slug(name)
         })
        .onConflictDoNothing();
    }
  });

  const existingWords = new Set<string>();
  const existingVideos = new Set<string>();

  console.log("Fetching existing words...");
  const existingWordRows = await db.select({ word: words.word }).from(words);
  existingWordRows.forEach((row) => existingWords.add(row.word));

  console.log("Fetching existing videos...");
  const existingVideoRows = await db
    .select({ url: videoUrls.url })
    .from(videoUrls);
  existingVideoRows.forEach((row) => existingVideos.add(row.url));

  const newWords: (typeof words.$inferInsert)[] = [];
  const newVideos = new Map<string, { url: string; size: number }>();
  const wordVideoLinks: { word: string; videoUrl: string }[] = [];

  console.log("Processing input data...");
  for (const entry of data) {
    if (existingWords.has(entry.item)) continue;

    newWords.push({
      word: entry.item,
      slug: slug(entry.item),
      definition: "",
      categoryId: Number(entry.category),
      url: entry.url,
      isAlphabet: [7, 8, 84].includes(Number(entry.category)),
    });

    for (const video of entry.video_sources || []) {
      const size = Number(video.size);
      if (!allowedSizes.includes(size)) continue;
      if (!video.url || existingVideos.has(video.url)) continue;

      newVideos.set(video.url, { url: video.url, size });
      wordVideoLinks.push({ word: entry.item, videoUrl: video.url });
    }
  }

  // Batch insert words
  console.log(`Inserting ${newWords.length} new words...`);
  const insertedWords: { id: number; word: string }[] = [];
  for (let i = 0; i < newWords.length; i += BATCH_SIZE) {
    const chunk = newWords.slice(i, i + BATCH_SIZE);
    const res = await db
      .insert(words)
      .values(chunk)
      .onConflictDoNothing()
      .returning({
        id: words.id,
        word: words.word,
      });
    insertedWords.push(...res);
  }
  const wordMap = new Map(insertedWords.map((w) => [w.word, w.id]));

  // Batch insert videos
  const newVideoArray = Array.from(newVideos.values());
  console.log(`Inserting ${newVideoArray.length} new videos...`);
  const insertedVideos: { id: number; url: string }[] = [];
  for (let i = 0; i < newVideoArray.length; i += BATCH_SIZE) {
    const chunk = newVideoArray.slice(i, i + BATCH_SIZE);
    const res = await db
      .insert(videoUrls)
      .values(chunk)
      .onConflictDoNothing()
      .returning({
        id: videoUrls.id,
        url: videoUrls.url,
      });
    insertedVideos.push(...res);
  }
  const videoMap = new Map(insertedVideos.map((v) => [v.url, v.id]));

  const wordVideosToInsert = wordVideoLinks
    .map(({ word, videoUrl }) => {
      const wordId = wordMap.get(word);
      const videoId = videoMap.get(videoUrl);
      if (wordId && videoId) return { wordId, videoId };
      return null;
    })
    .filter(Boolean) as { wordId: number; videoId: number }[];

  // Batch insert wordVideos
  console.log(`Linking ${wordVideosToInsert.length} word-videos...`);
  for (let i = 0; i < wordVideosToInsert.length; i += BATCH_SIZE) {
    const chunk = wordVideosToInsert.slice(i, i + BATCH_SIZE);
    await db.insert(wordVideos).values(chunk).onConflictDoNothing();
  }

  console.log("✅ Done.");
}

insertWordsFromFile().catch(console.error);
