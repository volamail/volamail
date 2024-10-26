import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { primaryKey } from "drizzle-orm/pg-core";
import { DEFAULT_THEME, type Theme } from "~/lib/templates/theme";
import { projectsTable } from "./projects.sql";
import { templateTranslationsTable } from "./template-translations.sql";

export const templatesTable = pgTable(
	"templates",
	{
		slug: text("slug").notNull(),
		projectId: text("project_id")
			.notNull()
			.references(() => projectsTable.id, {
				onDelete: "cascade",
			}),
		theme: jsonb("theme").notNull().$type<Theme>().default(DEFAULT_THEME),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.projectId, table.slug],
		}),
	}),
);

export const templatesRelations = relations(
	templatesTable,
	({ one, many }) => ({
		project: one(projectsTable, {
			fields: [templatesTable.projectId],
			references: [projectsTable.id],
		}),
		translations: many(templateTranslationsTable),
	}),
);
