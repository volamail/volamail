import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { domainsTable } from "./domains.sql";
import { imagesTable } from "./images.sql";
import { teamsTable } from "./teams.sql";
import { templatesTable } from "./templates.sql";
import { templateLanguages } from "./template-translations.sql";
import { DEFAULT_THEME, type Theme } from "~/lib/templates/theme";

export const projectsTable = pgTable(
	"projects",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(8)),
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
			}),
	},
	(table) => ({
		teamIdx: index("projects_team_id_idx").on(table.teamId),
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
