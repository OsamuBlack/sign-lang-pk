import { db } from "@/drizzle/db";
import { words, categories } from "@/drizzle/schema";
import { slug } from "./lib/slug";
import { eq } from "drizzle-orm";

const BATCH_SIZE = 100;

async function slugForWords() {
  // Update all categories with correct slugs in batches
  const categoriesData = await db.select().from(categories);
  const categoryUpdates = categoriesData
    .map((cat) => ({ id: cat.id, slug: slug(cat.name) }))
    .filter(({ id, slug: newSlug }) => {
      const cat = categoriesData.find((c) => c.id === id);
      return cat && cat.slug !== newSlug;
    });

  if (categoryUpdates.length > 0) {
    for (let i = 0; i < categoryUpdates.length; i += BATCH_SIZE) {
      const chunk = categoryUpdates.slice(i, i + BATCH_SIZE);
      await db.transaction(async (tx) => {
        for (const { id, slug } of chunk) {
          await tx.update(categories).set({ slug }).where(eq(categories.id, id));
        }
      });
    }
    console.log("Categories slugs updated.");
  } else {
    console.log("No categories needed slug updates.");
  }

  // Update all words with correct slugs in batches
  const wordsData = await db.select().from(words);
  const wordUpdates = wordsData
    .map((word) => ({ id: word.id, slug: slug(word.word) }))
    .filter(({ id, slug: newSlug }) => {
      const word = wordsData.find((w) => w.id === id);
      return word && word.slug !== newSlug;
    });

  if (wordUpdates.length > 0) {
    for (let i = 0; i < wordUpdates.length; i += BATCH_SIZE) {
      const chunk = wordUpdates.slice(i, i + BATCH_SIZE);
      await db.transaction(async (tx) => {
        for (const { id, slug } of chunk) {
          await tx.update(words).set({ slug }).where(eq(words.id, id));
        }
      });
    }
    console.log("Words slugs updated.");
  } else {
    console.log("No words needed slug updates.");
  }
}

slugForWords().catch(console.error);
