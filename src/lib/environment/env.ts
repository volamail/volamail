import * as v from "valibot";

import { formatValiError } from "../validation/utils";

export const env = getValidatedEnv();

function getValidatedEnv() {
	const schema = v.intersect([
		v.object({
			AWS_BUCKET: v.string(),
			AWS_REGION: v.string(),
			AWS_ACCESS_KEY_ID: v.string(),
			AWS_SECRET_ACCESS_KEY: v.string(),
			AWS_SNS_TOPIC_ARN: v.optional(v.string()),
			DATABASE_URL: v.string(),
			GITHUB_CLIENT_ID: v.optional(v.string()),
			GITHUB_CLIENT_SECRET: v.optional(v.string()),
			LLM_API_KEY: v.optional(v.string()),
			LLM_BASE_URL: v.optional(v.string()),
			NOREPLY_EMAIL: v.pipe(v.string(), v.email()),
			SITE_DOMAIN: v.string(),
			MAINTENANCE_MODE: v.optional(
				v.union([v.literal("true"), v.literal("false")]),
			),
		}),
		v.union([
			v.object({
				VITE_SELF_HOSTED: v.literal("false"),
				ADMIN_ID: v.optional(v.string()),
				POSTHOG_API_KEY: v.string(),
				STRIPE_SECRET_KEY: v.string(),
				STRIPE_WEBHOOK_SECRET: v.string(),
				STRIPE_PRO_PLAN_ID: v.string(),
			}),
			v.object({
				VITE_SELF_HOSTED: v.literal("true"),
			}),
		]),
	]);

	try {
		return v.parse(schema, process.env);
	} catch (e) {
		if (e instanceof v.ValiError) {
			throw new Error(`Invalid environment: ${formatValiError(e)}`);
		}

		throw new Error("Unknown environment error");
	}
}
