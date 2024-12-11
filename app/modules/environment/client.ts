import { z } from "zod";

const schema = z.object({
	VITE_SUPPORT_EMAIL: z.string().email(),
});

export const clientEnv = schema.parse({ ...process.env, ...import.meta.env });
