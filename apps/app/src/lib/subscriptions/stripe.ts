import Stripe from "stripe";

import { env } from "../environment/env";

export function getStripeInstance() {
	if (env.VITE_SELF_HOSTED === "true") {
		throw new Error("Stripe not available in self-hosted mode");
	}

	return new Stripe(env.STRIPE_SECRET_KEY);
}
