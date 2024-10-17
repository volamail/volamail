import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { object, string } from "valibot";
import { createError } from "vinxi/http";
import { action, redirect } from "@solidjs/router";

import { db } from "../db";
import { env } from "../environment/env";
import { requireUser } from "../auth/utils";
import { getStripeInstance } from "./stripe";
import { parseFormData } from "../server-utils";
import { subscriptionsTable } from "../db/schema";
import { requireUserToBeMemberOfTeam } from "../projects/utils";

export const redirectToProSubscriptionCheckout = action(
	async (formData: FormData) => {
		"use server";

		if (env.VITE_SELF_HOSTED === "true") {
			throw createError({
				status: 404,
				statusMessage: "Not found",
			});
		}

		const user = requireUser();

		const body = await parseFormData(
			object({
				teamId: string(),
				projectId: string(),
			}),
			formData,
		);

		await requireUserToBeMemberOfTeam({
			userId: user.id,
			teamId: body.teamId,
		});

		const stripe = getStripeInstance();

		const price = await stripe.prices.retrieve(env.STRIPE_PRO_PLAN_ID, {
			expand: ["product"],
		});

		const product = price.product as Stripe.Product;

		const checkoutLink = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [
				{
					quantity: 1,
					price: env.STRIPE_PRO_PLAN_ID,
				},
			],
			success_url: `${import.meta.env.DEV ? "http" : "https"}://${
				env.SITE_DOMAIN
			}/t/${body.teamId}/p/${body.projectId}/emails`,
			subscription_data: {
				metadata: {
					...product.metadata,
					team_id: body.teamId,
				},
			},
		});

		throw redirect(checkoutLink.url!);
	},
);

export const redirectToCustomerPortal = action(async (formData: FormData) => {
	"use server";

	if (env.VITE_SELF_HOSTED === "true") {
		throw createError({
			status: 404,
			statusMessage: "Not found",
		});
	}

	const user = requireUser();

	const body = await parseFormData(
		object({
			teamId: string(),
			projectId: string(),
		}),
		formData,
	);

	const { meta } = await requireUserToBeMemberOfTeam({
		userId: user.id,
		teamId: body.teamId,
	});

	const subscriptionRow = await db.query.subscriptionsTable.findFirst({
		where: eq(subscriptionsTable.id, meta.team.subscriptionId),
	});

	if (!subscriptionRow) {
		throw createError({
			statusCode: 404,
			statusMessage: "Subscription not found",
		});
	}

	if (subscriptionRow.tier === "CUSTOM" || subscriptionRow.tier === "FREE") {
		throw createError({
			statusCode: 403,
			statusMessage: "You can't access the customer portal",
		});
	}

	let portalUrl: string;

	const stripe = getStripeInstance();

	try {
		const subscription = await stripe.subscriptions.retrieve(
			subscriptionRow.providerId!,
		);

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: subscription.customer as string,
			return_url: `${import.meta.env.DEV ? "http" : "https"}://${
				env.SITE_DOMAIN
			}/t/${body.teamId}/p/${body.projectId}/usage`,
		});

		portalUrl = portalSession.url;
	} catch (e) {
		console.log(e);

		throw createError({
			statusCode: 500,
			statusMessage: "Internal server error",
		});
	}

	throw redirect(portalUrl);
});
