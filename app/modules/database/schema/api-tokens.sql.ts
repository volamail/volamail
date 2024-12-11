import { relations } from "drizzle-orm";
import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { projectsTable } from "./projects.sql";

export const apiTokensTable = pgTable(
	"api_tokens",
	{
		id: text("id").primaryKey().$defaultFn(ulid),
		token: text("token").notNull(),
		description: text("description").notNull().default(""),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		revokedAt: timestamp("revoked_at"),
		teamId: text("team_id").notNull(),
		projectId: text("project_id").notNull(),
	},
	(table) => ({
		projectFk: foreignKey({
			columns: [table.teamId, table.projectId],
			foreignColumns: [projectsTable.teamId, projectsTable.id],
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	}),
);

export const apiTokensRelations = relations(apiTokensTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [apiTokensTable.projectId],
		references: [projectsTable.id],
	}),
}));
