import { DEFAULT_THEME, type Theme } from "@/modules/templates/theme";
import { relations } from "drizzle-orm";
import { jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { domainsTable } from "./domains.sql";
import { templateLanguages } from "./enum/template-languages.sql";
import { imagesTable } from "./images.sql";
import { teamsTable } from "./teams.sql";
import { templatesTable } from "./templates.sql";

export const projectsTable = pgTable(
	"projects",
	{
		id: text("id").notNull(),
		name: text("name").notNull(),
		context: text("context"),
		defaultTheme: jsonb("default_theme")
			.notNull()
			.$type<Theme>()
			.default(DEFAULT_THEME),
		defaultTemplateLanguage: templateLanguages("default_template_language")
			.notNull()
			.default("en"),
		teamId: text("team_id")
			.notNull()
			.references(() => teamsTable.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.id, table.teamId] }),
	}),
);

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
	team: one(teamsTable, {
		fields: [projectsTable.teamId],
		references: [teamsTable.id],
	}),
	templates: many(templatesTable),
	images: many(imagesTable),
	domains: many(domainsTable),
}));

export type DbProject = typeof projectsTable.$inferSelect;
