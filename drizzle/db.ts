import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { config } from "dotenv";
config(); // Load environment variables from .env file

export const db = drizzle({
  connection:
    process.env.NODE_ENV === "development"
      ? {
          url: process.env.DATABASE_URL!,
        }
      : {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        },
  schema,
});
