import { env } from "@/modules/env";
import { handleInvoicePaidEvent } from "@/modules/payments/events/invoice-paid";
import { handleSubscriptionDeletedEvent } from "@/modules/payments/events/subscription-deleted";
import { handleSubscriptionUpdatedEvent } from "@/modules/payments/events/subscription-updated";
import { getStripe } from "@/modules/payments/stripe";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { Resource } from "sst";
import { getEvent, readRawBody } from "vinxi/http";

export const APIRoute = createAPIFileRoute("/api/internal/stripe/webhook")({
	async POST({ request }) {
		if (env.VITE_SELF_HOSTED === "true") {
			return json({ error: "Not implemented" }, { status: 501 });
		}

		const stripeSignature = request.headers.get("stripe-signature");

		if (!stripeSignature) {
			return json(
				{ error: "Missing stripe-signature header" },
				{ status: 400 },
			);
		}

		const requestEvent = getEvent();

		const body = await readRawBody(requestEvent);

		if (!body) {
			return json({ error: "Missing request body" }, { status: 400 });
		}

		const stripe = getStripe();

		const event = stripe.webhooks.constructEvent(
			body,
			stripeSignature,
			Resource.StripeWebhookSecret.value,
		);

		if (!event) {
			return json({ error: "Invalid stripe-signature" }, { status: 400 });
		}

		console.log("Received stripe event", event.type);
		if (event.type === "invoice.paid") {
			await handleInvoicePaidEvent(event);
		} else if (event.type === "customer.subscription.updated") {
			await handleSubscriptionUpdatedEvent(event);
		} else if (event.type === "customer.subscription.deleted") {
			await handleSubscriptionDeletedEvent(event);
		} else {
			return json({ message: "unhandled" });
		}

		return json({ message: "handled" });
	},
});
