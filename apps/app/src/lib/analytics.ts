import { PostHog } from "posthog-node";
import { env } from "~/lib/environment/env";

const client =
  "POSTHOG_API_KEY" in env
    ? new PostHog(env.POSTHOG_API_KEY, {
        host: "https://eu.i.posthog.com",
        flushAt: 1,
        flushInterval: 0,
      })
    : null;

export async function captureUserLoggedInEvent(user: {
  id: string;
  email: string;
}) {
  client?.capture({
    distinctId: user.id,
    event: "user_logged_in",
    properties: {
      email: user.email,
    },
  });

  await client?.shutdown();
}

export async function captureUserRegisteredEvent(user: {
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

  await client?.shutdown();
}
