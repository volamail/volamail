import { TEMPLATE_LANGUAGES } from "@/modules/templates/languages";
import type { JSONContent } from "@tiptap/core";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	foreignKey,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";
import { templateLanguages } from "./enum/template-languages.sql";
import { templatesTable } from "./templates.sql";

export const templateTranslationsTable = pgTable(
	"template_translations",
	{
		teamId: text("team_id").notNull(),
		projectId: text("project_id").notNull(),
		templateSlug: text("template_slug").notNull(),
		language: templateLanguages("language").notNull(),
		subject: text("subject").notNull(),
		contents: jsonb("contents").notNull().$type<JSONContent>(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [
				table.teamId,
				table.projectId,
				table.templateSlug,
				table.language,
			],
		}),
		templateFk: foreignKey({
			columns: [table.teamId, table.projectId, table.templateSlug],
			foreignColumns: [
				templatesTable.teamId,
				templatesTable.projectId,
				templatesTable.slug,
			],
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	}),
);

export type DbTemplateTranslation = InferSelectModel<
	typeof templateTranslationsTable
>;

export const templateTranslationsRelations = relations(
	templateTranslationsTable,
	({ one }) => ({
		template: one(templatesTable, {
			fields: [
				templateTranslationsTable.templateSlug,
				templateTranslationsTable.projectId,
			],
			references: [templatesTable.slug, templatesTable.projectId],
		}),
	}),
);
