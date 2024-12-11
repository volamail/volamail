import {
	foreignKey,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { templateLanguages } from "./enum/template-languages.sql";
import { projectsTable } from "./projects.sql";

export const emailStatus = pgEnum("email_status", [
	"SENT",
	"DELIVERED",
	"BOUNCED",
	"COMPLAINED",
]);

export const emailsTable = pgTable(
	"emails",
	{
		id: text("id").notNull().primaryKey(),
		teamId: text("team_id").notNull(),
		projectId: text("project_id").notNull(),
		from: text("from").notNull(),
		subject: text("subject").notNull(),
		to: text("to").notNull(),
		status: emailStatus("status").notNull(),
		sentAt: timestamp("sent_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		language: templateLanguages("language").default("en"),
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
