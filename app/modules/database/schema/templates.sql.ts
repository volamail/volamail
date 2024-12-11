import type { Theme } from "@/modules/templates/theme";
import { relations } from "drizzle-orm";
import {
	foreignKey,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { primaryKey } from "drizzle-orm/pg-core";
import { templateLanguages } from "./enum/template-languages.sql";
import { projectsTable } from "./projects.sql";
import { templateTranslationsTable } from "./template-translations.sql";

export const templatesTable = pgTable(
	"templates",
	{
		teamId: text("team_id").notNull(),
		projectId: text("project_id").notNull(),
		slug: text("slug").notNull(),
		theme: jsonb("theme").notNull().$type<Theme>(),
		defaultTranslationLanguage: templateLanguages(
			"default_translation_language",
		).notNull(),
		modifiedAt: timestamp("modified_at").notNull().defaultNow(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.teamId, table.projectId, table.slug],
		}),
		projectFk: foreignKey({
			columns: [table.teamId, table.projectId],
			foreignColumns: [projectsTable.teamId, projectsTable.id],
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	}),
);

export const templatesRelations = relations(
	templatesTable,
	({ one, many }) => ({
		project: one(projectsTable, {
			fields: [templatesTable.teamId, templatesTable.projectId],
			references: [projectsTable.teamId, projectsTable.id],
		}),
		defaultTranslation: one(templateTranslationsTable, {
			fields: [
				templatesTable.teamId,
				templatesTable.projectId,
				templatesTable.slug,
				templatesTable.defaultTranslationLanguage,
			],
			references: [
				templateTranslationsTable.teamId,
				templateTranslationsTable.projectId,
				templateTranslationsTable.templateSlug,
				templateTranslationsTable.language,
			],
		}),
		translations: many(templateTranslationsTable),
	}),
);
