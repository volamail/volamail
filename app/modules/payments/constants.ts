export const SUBSCRIPTION_TYPE_FREE = "FREE" as const;
export const SUBSCRIPTION_TYPE_PRO = "PRO" as const;
export const SUBSCRIPTION_TYPE_CUSTOM = "CUSTOM" as const;

export const SUBSCRIPTION_TIERS = [
  SUBSCRIPTION_TYPE_FREE,
  SUBSCRIPTION_TYPE_PRO,
  SUBSCRIPTION_TYPE_CUSTOM,
] as const;

export const SUBSCRIPTION_QUOTAS = {
  FREE: {
    emails: 500,
    projects: 2,
  },
  PRO: {
    emails: 10000,
    projects: 5,
  },
} satisfies {
  [K in (typeof SUBSCRIPTION_TIERS)[number]]?: {
    emails: number;
    projects: number;
  };
};
