import { z } from "zod";

const schema = z.object({
	DOMAIN: z.string(),
	GITHUB_CLIENT_ID: z.string(),
	DATABASE_URL: z.string().url(),
	GITHUB_CLIENT_SECRET: z.string(),
	NOREPLY_EMAIL: z.string().email(),
	SELF_HOSTED: z.union([z.literal("true"), z.literal("false")]),
});

export const serverEnv = schema.parse(process.env);
