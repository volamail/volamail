export const SUBSCRIPTION_TIERS = ["FREE", "PRO", "ENTERPRISE"] as const;

export const SUBSCRIPTION_QUOTAS = {
  FREE: 500,
  PRO: 10000,
} satisfies {
  [K in (typeof SUBSCRIPTION_TIERS)[number]]?: number;
};
