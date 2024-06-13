import { defineConfig } from "drizzle-kit";
import { env } from "~/lib/env";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schema: ["./src/**/*.sql.ts"],
  out: "./migrations",
  verbose: true,
  strict: true,
});
