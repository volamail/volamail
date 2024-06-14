import { object, parse, string } from "valibot";

export const env = parse(
  object({
    ANTHROPIC_API_KEY: string(),
    AWS_ACCESS_KEY_ID: string(),
    AWS_SECRET_ACCESS_KEY: string(),
    DATABASE_URL: string(),
    GITHUB_CLIENT_ID: string(),
    GITHUB_CLIENT_SECRET: string(),
    SITE_URL: string(),
  }),
  process.env
);
