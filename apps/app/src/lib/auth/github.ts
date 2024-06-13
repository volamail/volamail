import { GitHub } from "arctic";
import { env } from "../env";

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  {
    redirectURI: import.meta.env.DEV
      ? "http://localhost:3000/api/auth/login/github/callback"
      : `https://${env.VERCEL_PROJECT_PRODUCTION_URL}/api/auth/login/github/callback`,
  }
);
