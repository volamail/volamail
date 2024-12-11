import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { projectsTable } from "./projects.sql";
import { subscriptionsTable } from "./subscriptions.sql";
import { usersTable } from "./users.sql";

export const teamsTable = pgTable("teams", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});

export const teamMembersTable = pgTable(
	"team_members",
	{
		teamId: text("team_id").notNull(),
		userId: text("user_id").notNull(),
		joinedAt: timestamp("joined_at").notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.teamId, table.userId],
		}),
		teamFk: foreignKey({
			columns: [table.teamId],
			foreignColumns: [teamsTable.id],
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	}),
);

export const teamInvitesTable = pgTable(
	"team_invites",
	{
		code: text("code").primaryKey().$defaultFn(ulid),
		teamId: text("team_id").notNull(),
		email: text("email").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		teamIdx: index("team_invites_team_id_idx").on(table.teamId),
	}),
);

export const teamsRelations = relations(teamsTable, ({ many, one }) => ({
	projects: many(projectsTable),
	invites: many(teamInvitesTable),
	members: many(teamMembersTable),
	personalTeamOwner: one(usersTable),
	subscription: one(subscriptionsTable),
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
