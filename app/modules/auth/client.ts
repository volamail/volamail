import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "../client-env";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.PROD ? "https" : "http"}://${clientEnv.VITE_DOMAIN}`,
  plugins: [emailOTPClient()],
});
