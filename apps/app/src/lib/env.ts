import { object, optional, parse, string } from "valibot";

export const env = parse(
  object({
    AWS_ACCESS_KEY_ID: string(),
    AWS_SECRET_ACCESS_KEY: string(),
    DATABASE_URL: string(),
    GITHUB_CLIENT_ID: string(),
    GITHUB_CLIENT_SECRET: string(),
    OPENAI_API_KEY: string(),
    VERCEL_PROJECT_PRODUCTION_URL: optional(string()),
  }),
  process.env
);
