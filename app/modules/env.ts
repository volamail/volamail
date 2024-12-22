import { z } from "zod";

const schema = z.object({
	VITE_DOMAIN: z.string(),
	VITE_GITHUB_CLIENT_ID: z.string(),
	VITE_NOREPLY_EMAIL: z.string().email(),
	VITE_SELF_HOSTED: z.union([z.literal("true"), z.literal("false")]),
	VITE_SUPPORT_EMAIL: z.string().email(),
	VITE_STRIPE_PRO_PLAN_PRICE_ID: z.string(),
	VITE_LOG_LEVEL: z
		.preprocess(
			(arg) => (arg === "" ? undefined : arg),
			z.union([
				z.literal("debug"),
				z.literal("info"),
				z.literal("warn"),
				z.literal("error"),
			]),
		)
		.optional()
		.default("info"),
});

export const env = schema.parse(import.meta.env);
