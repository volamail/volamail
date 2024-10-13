import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";

import { teamsTable } from "./teams.sql";
import { SUBSCRIPTION_TIERS } from "~/lib/subscriptions/constants";

export const subscriptionTier = pgEnum("subscription_tier", SUBSCRIPTION_TIERS);

export const subscriptionStatus = pgEnum("subscription_status", [
	"ACTIVE",
	"CANCELED",
	"PAST_DUE",
]);

export const subscriptionPeriodType = pgEnum("subscription_period_type", [
	"MONTHLY",
	"ANNUAL",
]);

export const subscriptionsTable = pgTable("subscriptions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(32)),
	providerId: text("provider_id"),
	tier: subscriptionTier("tier").notNull(),
	renewsAt: timestamp("renews_at").notNull(),
	status: subscriptionStatus("status").notNull(),
	monthlyQuota: integer("monthly_quota").notNull(),
	remainingQuota: integer("remaining_quota").notNull(),
	lastRefilledAt: timestamp("last_refilled_at").notNull(),
	periodType: subscriptionPeriodType("period_type").notNull(),
	storageQuota: integer("storage_quota").notNull(),
	price: numeric("price", {
		scale: 2,
		precision: 12,
	}).notNull(),
});

export const subscriptionsRelations = relations(
	subscriptionsTable,
	({ one }) => ({
		team: one(teamsTable),
	}),
);
