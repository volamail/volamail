import { z } from "zod";

const schema = z.object({
	VITE_DOMAIN: z.string(),
	VITE_GITHUB_CLIENT_ID: z.string(),
	VITE_NOREPLY_EMAIL: z.string().email(),
	VITE_SELF_HOSTED: z.union([z.literal("true"), z.literal("false")]),
});

export const serverEnv = schema.parse(import.meta.env);
