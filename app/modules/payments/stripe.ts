import { Resource } from "sst";
import { Stripe } from "stripe";

export function getStripe() {
	return new Stripe(Resource.StripeSecretKey.value);
}
