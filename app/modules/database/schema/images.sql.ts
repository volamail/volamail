import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const imagesTable = pgTable(
	"images",
	{
		id: text("id").notNull().primaryKey(),
		name: text("name").notNull(),
		size: integer("size").notNull(),
		dimensions: text("dimensions"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const imagesRelations = relations(imagesTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [imagesTable.projectId],
		references: [projectsTable.id],
	}),
}));
