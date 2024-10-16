import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { domainsTable } from "./domains.sql";
import { projectsTable } from "./projects.sql";
import { subscriptionsTable } from "./subscriptions.sql";
import { usersTable } from "./users.sql";

export const teamsTable = pgTable(
	"teams",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(8)),
		name: text("name").notNull(),
		subscriptionId: text("subscription_id")
			.notNull()
			.references(() => subscriptionsTable.id),
	},
	(table) => ({
		subscriptionIdx: index("teams_subscription_id_idx").on(
			table.subscriptionId,
		),
	}),
);

export const teamMembersTable = pgTable(
	"team_members",
	{
		teamId: text("team_id")
			.notNull()
			.references(() => teamsTable.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		joinedAt: timestamp("joined_at").notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.teamId, table.userId],
		}),
	}),
);

export const teamInvitesTable = pgTable(
	"team_invites",
	{
		teamId: text("team_id")
			.notNull()
			.references(() => teamsTable.id, {
				onDelete: "cascade",
			}),
		email: text("email").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.teamId, table.email],
		}),
	}),
);

export const teamsRelations = relations(teamsTable, ({ many, one }) => ({
	projects: many(projectsTable),
	invites: many(teamInvitesTable),
	members: many(teamMembersTable),
	personalTeamOwner: one(usersTable),
	subscription: one(subscriptionsTable, {
		fields: [teamsTable.subscriptionId],
		references: [subscriptionsTable.id],
	}),
}));

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
	team: one(teamsTable, {
		fields: [teamMembersTable.teamId],
		references: [teamsTable.id],
	}),
	user: one(usersTable, {
		fields: [teamMembersTable.userId],
		references: [usersTable.id],
	}),
}));

export const teamInvitesRelations = relations(teamInvitesTable, ({ one }) => ({
	team: one(teamsTable, {
		fields: [teamInvitesTable.teamId],
		references: [teamsTable.id],
	}),
}));

export type DbTeam = typeof teamsTable.$inferSelect;
