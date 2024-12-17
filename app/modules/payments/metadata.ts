import { z } from "zod";
import { SUBSCRIPTION_TYPE_CUSTOM, SUBSCRIPTION_TYPE_PRO } from "./constants";

export const subscriptionMetaSchema = z.intersection(
	z.object({
		team_id: z.string(),
	}),
	z.discriminatedUnion("type", [
		z.object({
			type: z.literal(SUBSCRIPTION_TYPE_PRO),
		}),
		z.object({
			type: z.literal(SUBSCRIPTION_TYPE_CUSTOM),
			monthly_email_quota: z.coerce.number(),
			storage: z.coerce.number(),
			// TODO: Handle more fields (max team members, max projects, different model etc.)
		}),
	]),
);
