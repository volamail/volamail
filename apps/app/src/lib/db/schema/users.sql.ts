import { relations } from "drizzle-orm";
import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";
import { teamMembersTable, teamsTable } from "./teams.sql";

export const usersTable = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull(),
		name: text("name").notNull(),
		githubId: integer("github_id"),
		personalTeamId: text("personal_team_id")
			.notNull()
			.references(() => teamsTable.id),
	},
	(table) => ({
		personalTeamIdx: index("users_personal_team_id_idx").on(
			table.personalTeamId,
		),
	}),
);

export const usersRelations = relations(usersTable, ({ many, one }) => ({
	projects: many(projectsTable),
	teams: many(teamMembersTable),
	personalTeam: one(teamsTable, {
		fields: [usersTable.personalTeamId],
		references: [teamsTable.id],
	}),
}));
