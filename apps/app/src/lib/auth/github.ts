import { GitHub } from "arctic";
import { env } from "../env";

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  {
    redirectURI: import.meta.env.PROD
      ? `https://${env.SITE_URL}/api/auth/login/github/callback`
      : "http://localhost:3000/api/auth/login/github/callback",
  }
);
