import { z } from "zod";

const schema = z.object({
	VITE_SUPPORT_EMAIL: z.string().email(),
	VITE_LOG_LEVEL: z.union([
		z.literal("debug"),
		z.literal("info"),
		z.literal("warn"),
		z.literal("error"),
	]),
});

export const clientEnv = schema.parse({ ...process.env, ...import.meta.env });
