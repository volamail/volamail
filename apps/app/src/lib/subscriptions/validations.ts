import * as v from "valibot";
import { SUBSCRIPTION_TYPE_CUSTOM, SUBSCRIPTION_TYPE_PRO } from "./constants";

export const subscriptionMetaSchema = v.intersect([
  v.object({
    team_id: v.string(),
  }),
  v.variant("type", [
    v.object({
      type: v.literal(SUBSCRIPTION_TYPE_PRO),
    }),
    v.object({
      type: v.literal(SUBSCRIPTION_TYPE_CUSTOM),
      monthly_email_quota: v.pipe(v.unknown(), v.transform(Number)),
      storage: v.pipe(v.unknown(), v.transform(Number)),
      // TODO: Handle more fields (max team members, max projects, different model etc.)
    }),
  ]),
]);
