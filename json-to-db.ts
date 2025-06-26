// import { db } from "@/drizzle/db"; // your drizzle client
// import { words, videoUrls, wordVideos, categories } from "@/drizzle/schema";
// import { eq, sql } from "drizzle-orm/";
// import fs from "fs/promises";

// async function insertWordsFromFile() {
//   const raw = await fs.readFile("../json/all_video_sources.json", "utf-8");
//   const categoriesRaw = await fs.readFile(
//     "../json/psl_categories.json",
//     "utf-8"
//   );
//   const data = JSON.parse(raw);
//   const categoriesData: [string, string][] = JSON.parse(categoriesRaw);

//   const allowedSizes = [240, 360, 480, 720];

//   // First show all tables names
//   const tables = await db.run(
//     sql`SELECT name FROM sqlite_master WHERE type='table'`
//   );
//   console.log(
//     "Tables in the database:",
//     tables
//   );

//   // Insert categories if they don't exist
//   for (const [id, name] of categoriesData) {
//     const existingCategory = await db
//       .select()
//       .from(categories)
//       .where(eq(categories.id, Number(id)))
//       .limit(1);

//     if (existingCategory.length === 0) {
//       await db.insert(categories).values({
//         id: Number(id),
//         name,
//       });
//     }
//   }

//   for (const entry of data) {
//     // Insert word and get last inserted id
//     await db.insert(words).values({
//       word: entry.item,
//       definition: "",
//       categoryId: Number(entry.category),
//       url: entry.url,
//       isAlphabet: [7, 8, 84].includes(Number(entry.category)),
//     });

//     // Get last inserted word id
//     const wordIdRow = await db.get(sql`SELECT last_insert_rowid() as id`);
//     const wordId = wordIdRow.id;

//     for (const video of entry.video_sources) {
//       const size = Number(video.size);
//       if (!allowedSizes.includes(size)) continue;
//       if (!video.url) continue;

//       await db.insert(videoUrls).values({
//         url: video.url,
//         size,
//       });

//       // Get last inserted video id
//       const videoIdRow = await db.get(sql`SELECT last_insert_rowid() as id`);
//       const videoId = videoIdRow.id;

//       await db.insert(wordVideos).values({
//         wordId,
//         videoId,
//       });
//     }
//   }

//   console.log("✅ Inserted all words.");
// }

// insertWordsFromFile().catch(console.error);
// insertWordsFromFile().catch(console.error);
