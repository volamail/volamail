import { relations } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { projectsTable } from "./projects.sql";

export const domainsTable = pgTable(
	"domains",
	{
		id: text("id").primaryKey().$defaultFn(ulid),
		domain: text("address").notNull(),
		verified: boolean("verified").notNull().default(false),
		tokens: text("tokens").array().notNull(),
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

export const domainsRelations = relations(domainsTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [domainsTable.projectId],
		references: [projectsTable.id],
	}),
}));
