import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Categories Table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const categoryRelations = relations(categories, ({ many }) => ({
  words: many(words),
}));

// Words Table
export const words = sqliteTable("words", {
  id: integer("id").primaryKey(),
  word: text("word").notNull(),
  isAlphabet: integer("is_alphabet", { mode: "boolean" }).default(false),
  definition: text("definition").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date())
    .$onUpdate(() => new Date()),
  url: text("url").notNull(),
});

export const wordRelations = relations(words, ({ one, many }) => ({
  category: one(categories, {
    fields: [words.categoryId],
    references: [categories.id],
  }),
  wordVideos: many(wordVideos),
}));

// Video URLs Table
export const videoUrls = sqliteTable("video_urls", {
  id: integer("id").primaryKey(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
});

export const videoUrlRelations = relations(videoUrls, ({ many }) => ({
  wordVideos: many(wordVideos),
}));

export const wordVideos = sqliteTable("word_videos", {
  wordId: integer("word_id").references(() => words.id),
  videoId: integer("video_id").references(() => videoUrls.id),
});

export const wordVideosRelations = relations(wordVideos, ({ one }) => ({
  video: one(videoUrls, {
    fields: [wordVideos.videoId],
    references: [videoUrls.id],
  }),
  word: one(words, {
    fields: [wordVideos.wordId],
    references: [words.id],
  }),
}));