import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso", // 'mysql' | 'sqlite' | 'turso'
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
