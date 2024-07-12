import { APIEvent } from "@solidjs/start/server";
import { createError, readRawBody } from "vinxi/http";

import { env } from "~/lib/environment/env";
import {
  handleInvoicePaidEvent,
  handleSubscriptionDeletedEvent,
  handleSubscriptionUpdatedEvent,
} from "~/lib/subscriptions/event-handlers";
import { getStripeInstance } from "~/lib/subscriptions/stripe";

export async function POST({ request, nativeEvent }: APIEvent) {
  if (env.VITE_SELF_HOSTED === "true") {
    throw createError({
      status: 404,
      statusMessage: "Not found",
    });
  }

  const stripeSignature = request.headers.get("stripe-signature");

  const body = await readRawBody(nativeEvent);

  if (!body || !stripeSignature) {
    throw createError({
      status: 400,
      statusMessage: "Bad request from Stripe",
    });
  }

  const stripe = getStripeInstance();

  const event = stripe.webhooks.constructEvent(
    body,
    stripeSignature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "invoice.paid") {
    await handleInvoicePaidEvent({ event, stripe });
  } else if (event.type === "customer.subscription.updated") {
    await handleSubscriptionUpdatedEvent({ event });
  } else if (event.type === "customer.subscription.deleted") {
    await handleSubscriptionDeletedEvent({ event });
  }

  return {
    success: true,
  };
}
