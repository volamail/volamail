import * as v from "valibot";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import type Stripe from "stripe";

import {
	SUBSCRIPTION_QUOTAS,
	SUBSCRIPTION_TYPE_FREE,
	SUBSCRIPTION_TYPE_CUSTOM,
} from "./constants";
import { db } from "../db";
import { subscriptionMetaSchema } from "./validations";
import { capturePlanPurchaseEvent } from "../analytics";
import { subscriptionsTable, teamsTable } from "../db/schema";

export async function handleInvoicePaidEvent({
	event,
	stripe,
}: {
	stripe: Stripe;
	event: Stripe.InvoicePaidEvent;
}) {
	const subscriptionId = event.data.object.subscription;

	if (!subscriptionId || typeof subscriptionId !== "string") {
		throw new Error("Received invoice.paid event without subscription ID");
	}

	const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
		expand: ["schedule"],
	});

	const subscriptionMeta = await v.parseAsync(
		subscriptionMetaSchema,
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

	const monthlyEmailQuota =
		subscriptionMeta.type === SUBSCRIPTION_TYPE_CUSTOM
			? subscriptionMeta.monthly_email_quota
			: SUBSCRIPTION_QUOTAS[subscriptionMeta.type].emails;

	const storageQuota =
		subscriptionMeta.type === SUBSCRIPTION_TYPE_CUSTOM
			? subscriptionMeta.storage
			: SUBSCRIPTION_QUOTAS[subscriptionMeta.type].storage;

	if (team.subscription && team.subscription.tier !== "FREE") {
		await db
			.update(subscriptionsTable)
			.set({
				status: "ACTIVE",
			})
			.where(eq(subscriptionsTable.id, team.subscription.id));

		return;
	}

	const schedule = subscription.schedule as Stripe.SubscriptionSchedule;

	const isYearly =
		DateTime.fromSeconds(schedule.current_phase!.end_date).diff(
			DateTime.fromSeconds(schedule.current_phase!.start_date),
			"months",
		).months > 6;

	// TODO: Make this work with more than one item in the subscription
	// eg. with per-seat pricing

	const price = subscription.items.data[0].price.unit_amount! / 100;

	await db.transaction(async (db) => {
		await db
			.delete(subscriptionsTable)
			.where(eq(subscriptionsTable.id, team.subscription.id));

		const [createdSubscription] = await db
			.insert(subscriptionsTable)
			.values({
				providerId: subscription.id,
				tier: subscriptionMeta.type,
				renewsAt: DateTime.fromSeconds(
					subscription.current_period_end,
				).toJSDate(),
				status: "ACTIVE",
				monthlyQuota: monthlyEmailQuota,
				remainingQuota: monthlyEmailQuota,
				lastRefilledAt: DateTime.now().toJSDate(),
				periodType: isYearly ? "ANNUAL" : "MONTHLY",
				price: price.toFixed(2),
				storageQuota,
			})
			.returning({ id: subscriptionsTable.id });

		await db
			.update(teamsTable)
			.set({
				subscriptionId: createdSubscription.id,
			})
			.where(eq(teamsTable.id, team.id));
	});

	await capturePlanPurchaseEvent(team);
}

export async function handleSubscriptionUpdatedEvent({
	event,
}: {
	event: Stripe.CustomerSubscriptionUpdatedEvent;
}) {
	const subscription = event.data.object;

	const subscriptionMeta = await v.parseAsync(
		subscriptionMetaSchema,
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
		DateTime.fromSeconds(subscription.current_period_end).diff(
			DateTime.fromSeconds(subscription.current_period_start),
			"months",
		).months > 6;

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
			renewsAt: DateTime.fromSeconds(
				subscription.current_period_end,
			).toJSDate(),
			periodType: isYearly ? "ANNUAL" : "MONTHLY",
			monthlyQuota: monthlyEmailQuota,
			storageQuota: storageQuota,
			tier: subscriptionMeta.type,
			price: price.toFixed(2),
			lastRefilledAt: didTierChange ? DateTime.now().toJSDate() : undefined,
			remainingQuota: didTierChange ? monthlyEmailQuota : undefined,
			providerId: subscription.id,
		})
		.where(eq(subscriptionsTable.id, team.subscription.id));
}

export async function handleSubscriptionDeletedEvent({
	event,
}: {
	event: Stripe.CustomerSubscriptionDeletedEvent;
}) {
	const subscription = event.data.object;

	const subscriptionMeta = await v.parseAsync(
		subscriptionMetaSchema,
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
			monthlyQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].emails,
			remainingQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].emails,
			status: "ACTIVE",
			tier: SUBSCRIPTION_TYPE_FREE,
			storageQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].storage,
			lastRefilledAt: DateTime.now().toJSDate(),
			renewsAt: DateTime.now().plus({ days: 30 }).toJSDate(),
			periodType: "MONTHLY",
			providerId: null,
			price: "0.00",
		})
		.where(eq(subscriptionsTable.id, team.subscription.id));
}
