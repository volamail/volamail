import type { JSONContent } from "@tiptap/core";
import { relations } from "drizzle-orm";
import {
	foreignKey,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";
import { templatesTable } from "~/lib/db/schema/templates.sql";
import { TEMPLATE_LANGUAGES } from "~/lib/templates/languages";

export const templateLanguages = pgEnum(
	"template_languages",
	TEMPLATE_LANGUAGES,
);

export const templateTranslationsTable = pgTable(
	"template_translations",
	{
		projectId: text("project_id").notNull(),
		templateSlug: text("template_slug").notNull(),
		language: templateLanguages("language").notNull(),
		subject: text("subject").notNull(),
		contents: jsonb("contents").notNull().$type<JSONContent>(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.projectId, table.templateSlug, table.language],
		}),
		templateReference: foreignKey({
			columns: [table.projectId, table.templateSlug],
			foreignColumns: [templatesTable.projectId, templatesTable.slug],
		}),
	}),
);

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
