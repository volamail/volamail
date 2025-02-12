import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  schema: "./app/modules/database/schema/index.ts",
  out: "./migrations",
  strict: true,
});
