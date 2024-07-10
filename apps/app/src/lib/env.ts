import {
  email,
  object,
  optional,
  parse,
  pipe,
  string,
  ValiError,
} from "valibot";

import { formatValiError } from "./validation/utils";

export const env = getValidatedEnv();

function getValidatedEnv() {
  const schema = object({
    ADMIN_ID: optional(string()),
    ANTHROPIC_API_KEY: string(),
    AWS_BUCKET: string(),
    AWS_REGION: string(),
    AWS_ACCESS_KEY_ID: string(),
    AWS_SECRET_ACCESS_KEY: string(),
    DATABASE_URL: string(),
    GITHUB_CLIENT_ID: string(),
    GITHUB_CLIENT_SECRET: string(),
    NOREPLY_EMAIL: pipe(string(), email()),
    SITE_DOMAIN: string(),
    STRIPE_SECRET_KEY: string(),
    STRIPE_WEBHOOK_SECRET: string(),
    STRIPE_PRO_PLAN_ID: string(),
  });

  try {
    return parse(schema, process.env);
  } catch (e) {
    if (e instanceof ValiError) {
      throw new Error(`Invalid environment: ${formatValiError(e)}`);
    }

    throw new Error("Unknown environment error");
  }
}
