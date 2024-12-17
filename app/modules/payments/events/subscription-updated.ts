import { db } from "@/modules/database";
import { subscriptionsTable, teamsTable } from "@/modules/database/schema";
import { differenceInMonths } from "date-fns";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { SUBSCRIPTION_QUOTAS, SUBSCRIPTION_TYPE_CUSTOM } from "../constants";
import { subscriptionMetaSchema } from "../metadata";

export async function handleSubscriptionUpdatedEvent(
	event: Stripe.CustomerSubscriptionUpdatedEvent,
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

	const isYearly =
		differenceInMonths(
			new Date(subscription.current_period_end * 1000),
			new Date(subscription.current_period_end * 1000),
		) > 6;

	const monthlyEmailQuota =
		subscriptionMeta.type === SUBSCRIPTION_TYPE_CUSTOM
			? subscriptionMeta.monthly_email_quota
			: SUBSCRIPTION_QUOTAS[subscriptionMeta.type].emails;

	const storageQuota =
		subscriptionMeta.type === SUBSCRIPTION_TYPE_CUSTOM
			? subscriptionMeta.storage
			: SUBSCRIPTION_QUOTAS[subscriptionMeta.type].storage;

	// TODO: Make this work with more than one item in the subscription
	// eg. with per-seat pricing
	const price = subscription.items.data[0].price.unit_amount! / 100;

	const didTierChange = team.subscription.tier !== subscriptionMeta.type;

	await db
		.update(subscriptionsTable)
		.set({
			status:
				subscription.status === "past_due"
					? "PAST_DUE"
					: subscription.cancel_at !== null
						? "CANCELED"
						: "ACTIVE",
			renewsAt: new Date(subscription.current_period_end * 1000),
			periodType: isYearly ? "ANNUAL" : "MONTHLY",
			monthlyQuota: monthlyEmailQuota,
			storageQuota: storageQuota,
			tier: subscriptionMeta.type,
			price: price.toFixed(2),
			lastRefilledAt: didTierChange ? new Date() : undefined,
			remainingQuota: didTierChange ? monthlyEmailQuota : undefined,
			providerId: subscription.id,
		})
		.where(eq(subscriptionsTable.id, team.subscription.id));
}
