import { Resource } from "sst";
import { Stripe } from "stripe";

export const stripe = new Stripe(Resource.StripeSecretKey.value);

console.log(Resource.StripeSecretKey.value);