import { object, parse, string, ValiError, ObjectPathItem } from "valibot";

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
  });

  try {
    return parse(schema, process.env);
  } catch (e) {
    if (e instanceof ValiError) {
      throw new Error(
        `Invalid environment: ${e.issues
          .map(
            (issue) =>
              `${issue.path
                ?.map((path: ObjectPathItem) => path.key)
                .join(".")}: ${issue.message}`
          )
          .join(", ")}`
      );
    }

    throw new Error("Unknown environment error");
  }
}
