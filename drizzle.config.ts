import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "sqlite", // 'mysql' | 'sqlite' | 'turso'
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: "file:./database.db",
  },
});
