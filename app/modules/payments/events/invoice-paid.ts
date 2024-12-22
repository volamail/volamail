import { db } from "@/modules/database";
import { subscriptionsTable, teamsTable } from "@/modules/database/schema";
import { differenceInMonths } from "date-fns";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { SUBSCRIPTION_QUOTAS, SUBSCRIPTION_TYPE_CUSTOM } from "../constants";
import { subscriptionMetaSchema } from "../metadata";
import { stripe } from "../stripe";

export async function handleInvoicePaidEvent(event: Stripe.InvoicePaidEvent) {
	const subscriptionId = event.data.object.subscription;

	if (!subscriptionId || typeof subscriptionId !== "string") {
		throw new Error("Received invoice.paid event without subscription ID");
	}

	const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
		expand: ["schedule"],
	});

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

	const monthlyEmailQuota =
		subscriptionMeta.type === SUBSCRIPTION_TYPE_CUSTOM
			? subscriptionMeta.monthly_email_quota
			: SUBSCRIPTION_QUOTAS[subscriptionMeta.type].emails;

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
		differenceInMonths(
			new Date(schedule.current_phase!.end_date * 1000),
			new Date(schedule.current_phase!.start_date * 1000),
		) > 6;

	// TODO: Make this work with more than one item in the subscription
	// eg. with per-seat pricing

	const price = subscription.items.data[0].price.unit_amount! / 100;

	await db.transaction(async (db) => {
		await db
			.delete(subscriptionsTable)
			.where(eq(subscriptionsTable.teamId, team.id));

		await db
			.insert(subscriptionsTable)
			.values({
				stripeCustomerId: subscription.customer as string,
				tier: subscriptionMeta.type,
				renewsAt: new Date(subscription.current_period_end * 1000),
				status: "ACTIVE",
				monthlyEmailQuota: monthlyEmailQuota,
				refillsAt: new Date(subscription.current_period_end * 1000),
				lastRefilledAt: new Date(),
				periodType: isYearly ? "ANNUAL" : "MONTHLY",
				price: price.toFixed(2),
				teamId: team.id,
			})
			.returning({ id: subscriptionsTable.id });
	});
}
