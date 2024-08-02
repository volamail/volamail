import { PostHog } from "posthog-node";
import { env } from "~/lib/environment/env";

const client =
  "POSTHOG_API_KEY" in env
    ? new PostHog(env.POSTHOG_API_KEY, {
        host: "https://app.posthog.com",
      })
    : null;

export function captureUserRegisteredEvent(user: {
  id: string;
  email: string;
}) {
  client?.capture({
    distinctId: user.id,
    event: "user_registered",
    properties: {
      email: user.email,
    },
  });
}
