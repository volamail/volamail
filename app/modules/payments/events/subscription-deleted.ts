import { db } from "@/modules/database";
import { subscriptionsTable, teamsTable } from "@/modules/database/schema";
import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { SUBSCRIPTION_QUOTAS, SUBSCRIPTION_TYPE_FREE } from "../constants";
import { subscriptionMetaSchema } from "../metadata";

export async function handleSubscriptionDeletedEvent(
	event: Stripe.CustomerSubscriptionDeletedEvent,
) {
	const subscription = event.data.object;

	const subscriptionMeta = await subscriptionMetaSchema.parseAsync(
		subscription.metadata,
	);

	const team = await db.query.teamsTable.findFirst({
		where: eq(teamsTable.id, subscriptionMeta.team_id),
		with: {
			subscription: true,
		},
	});

	if (!team) {
		throw new Error("Team not found");
	}

	if (!team.subscription) {
		throw new Error("Team has no subscription");
	}

	await db
		.update(subscriptionsTable)
		.set({
			monthlyEmailQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].emails,
			status: "ACTIVE",
			tier: SUBSCRIPTION_TYPE_FREE,
			lastRefilledAt: new Date(),
			refillsAt: addDays(new Date(), 30),
			renewsAt: addDays(new Date(), 30),
			periodType: "MONTHLY",
			providerId: null,
			price: "0.00",
		})
		.where(eq(subscriptionsTable.id, team.subscription.id));
}
