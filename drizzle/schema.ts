import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// Categories Table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

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

// Video URLs Table
export const videoUrls = sqliteTable("video_urls", {
  id: integer("id").primaryKey(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
});

// Word-Videos Mapping Table (many-to-many)
export const wordVideos = sqliteTable(
  "word_videos",
  {
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videoUrls.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.wordId, table.videoId] })]
);
