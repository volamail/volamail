import { GitHub } from "arctic";
import { env } from "../env";

type GithubAuthParams = {
  to?: string;
};

export function createGithubAuth({ to }: GithubAuthParams = {}) {
  const url = new URL(
    import.meta.env.PROD
      ? `https://${env.SITE_URL}/api/auth/login/github/callback`
      : "http://localhost:3000/api/auth/login/github/callback"
  );

  if (to) {
    url.searchParams.set("to", to);
  }

  return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, {
    redirectURI: url.toString(),
  });
}
