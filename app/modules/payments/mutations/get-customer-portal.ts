import { getOrigin } from "@/modules/rpcs/origin";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { getStripe } from "../stripe";

export const createCustomerPortalSession = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectToRedirectTo: z.string(),
				stripeCustomerId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const { teamId, projectToRedirectTo, stripeCustomerId } = data;

		const stripe = getStripe();

		const session = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId,
			return_url: `${getOrigin()}/t/${teamId}/p/${projectToRedirectTo}/billing`,
		});

		return session.url;
	});
