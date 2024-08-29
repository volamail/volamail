import { cache } from "@solidjs/router";
import { env } from "./env";

export const getAppEnvironmentInfo = cache(async () => {
  "use server";

  return {
    instance: {
      prod: import.meta.env.PROD,
      version: import.meta.env.VITE_PUBLIC_APP_VERSION,
      selfHosted: env.VITE_SELF_HOSTED === "true",
    },
    auth: {
      githubEnabled: env.VITE_GITHUB_CLIENT_ID !== undefined,
    },
    notifications: {
      enabled: env.AWS_SNS_TOPIC_ARN !== undefined,
    },
  };
}, "env");
