import { GitHub } from "arctic";
import { env } from "../environment/env";

type GithubAuthParams = {
  to?: string;
};

export function createGithubAuth({ to }: GithubAuthParams = {}) {
  if (!env.VITE_GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB env vars not set");
  }

  const url = new URL(
    import.meta.env.PROD
      ? `https://${env.SITE_DOMAIN}/api/auth/login/github/callback`
      : "http://localhost:3000/api/auth/login/github/callback"
  );

  if (to) {
    url.searchParams.set("to", to);
  }

  return new GitHub(env.VITE_GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, {
    redirectURI: url.toString(),
  });
}
