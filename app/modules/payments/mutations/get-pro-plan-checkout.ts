import { clientEnv } from "@/modules/client-env";
import { db } from "@/modules/database";
import { getOrigin } from "@/modules/rpcs/origin";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import type { subscriptionMetaSchema } from "../metadata";
import { getStripe } from "../stripe";

export const createProPlanCheckout = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectToRedirectTo: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const { teamId, projectToRedirectTo } = data;

		const subscription = await db.query.subscriptionsTable.findFirst({
			where: (table, { eq }) => eq(table.teamId, teamId),
		});

		if (!subscription) {
			throw new Error("Subscription not found");
		}

		if (subscription.tier !== "FREE") {
			throw new Error("Team already has a subscription");
		}

		const subscriptionMeta: z.infer<typeof subscriptionMetaSchema> = {
			team_id: teamId,
			type: "PRO",
		};

		const stripe = getStripe();

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [
				{
					price: clientEnv.VITE_STRIPE_PRO_PLAN_PRICE_ID,
					quantity: 1,
				},
			],
			success_url: `${getOrigin()}/t/${teamId}/p/${projectToRedirectTo}/billing?purchase_success=true`,
			cancel_url: `${getOrigin()}/t/${teamId}/p/${projectToRedirectTo}/billing`,
			subscription_data: {
				metadata: subscriptionMeta,
			},
		});

		return session.url!;
	});
