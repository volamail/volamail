import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	schema: "./src/lib/db/schema/index.ts",
	out: "./migrations",
	verbose: true,
	strict: true,
});
