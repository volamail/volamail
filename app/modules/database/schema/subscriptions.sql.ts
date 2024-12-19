import { relations } from "drizzle-orm";
import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { SUBSCRIPTION_TIERS } from "@/modules/payments/constants";
import { teamsTable } from "./teams.sql";

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
		.$defaultFn(() => ulid()),
	teamId: text("team_id")
		.notNull()
		.references(() => teamsTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	providerId: text("provider_id"),
	tier: subscriptionTier("tier").notNull(),
	renewsAt: timestamp("renews_at").notNull(),
	status: subscriptionStatus("status").notNull(),
	monthlyEmailQuota: integer("monthly_quota").notNull(),
	refillsAt: timestamp("refills_at").notNull(),
	lastRefilledAt: timestamp("last_refilled_at").notNull(),
	periodType: subscriptionPeriodType("period_type").notNull(),
	maxDomains: integer("max_domains").notNull().default(2),
	maxProjects: integer("max_projects").notNull().default(2),
	price: numeric("price", {
		scale: 2,
		precision: 12,
	}).notNull(),
});

export const subscriptionsRelations = relations(
	subscriptionsTable,
	({ one }) => ({
		team: one(teamsTable, {
			fields: [subscriptionsTable.teamId],
			references: [teamsTable.id],
		}),
	}),
);
