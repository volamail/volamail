import { object, parse, string, ValiError, optional } from "valibot";

import { formatValiError } from "./validation/utils";

export const env = getValidatedEnv();

function getValidatedEnv() {
  const schema = object({
    ANTHROPIC_API_KEY: string(),
    AWS_BUCKET: string(),
    AWS_REGION: string(),
    AWS_ACCESS_KEY_ID: string(),
    AWS_SECRET_ACCESS_KEY: string(),
    DATABASE_URL: string(),
    GITHUB_CLIENT_ID: string(),
    GITHUB_CLIENT_SECRET: string(),
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
