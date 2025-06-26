import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
  unique,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Categories Table
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [
    unique("categories_name_slug_key").on(table.name, table.slug),
    index("categories_name_idx").on(table.name),
    index("categories_slug_idx").on(table.slug),
  ]
);

export const categoryRelations = relations(categories, ({ many }) => ({
  words: many(words),
}));

// Words Table
export const words = sqliteTable(
  "words",
  {
    id: integer("id").primaryKey(),
    word: text("word").notNull(),
    slug: text("slug").notNull(),
    isAlphabet: integer("is_alphabet", { mode: "boolean" }).default(false),
    definition: text("definition").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(current_timestamp)`),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
  },
  (table) => [
    index("words_word_idx").on(table.word),
    index("words_category_id_idx").on(table.categoryId),
    index("words_is_alphabet_idx").on(table.isAlphabet),
    index("words_slug_idx").on(table.slug),
  ]
);

export const wordRelations = relations(words, ({ one, many }) => ({
  category: one(categories, {
    fields: [words.categoryId],
    references: [categories.id],
  }),
  wordVideos: many(wordVideos),
}));

// Video URLs Table
export const videoUrls = sqliteTable(
  "video_urls",
  {
    id: integer("id").primaryKey(),
    url: text("url").notNull(),
    size: integer("size").notNull(),
    type: text("type"),
  },
  (table) => [
    index("video_urls_size_idx").on(table.size),
    index("video_urls_type_idx").on(table.type),
  ]
);

export const videoUrlRelations = relations(videoUrls, ({ many }) => ({
  wordVideos: many(wordVideos),
}));

export const wordVideos = sqliteTable(
  "word_videos",
  {
    wordId: integer("word_id").references(() => words.id, {
      onDelete: "cascade",
    }),
    videoId: integer("video_id").references(() => videoUrls.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.wordId, table.videoId] })]
);

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
