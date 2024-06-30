import { relations } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { domainsTable } from "./domains.sql";
import { imagesTable } from "./images.sql";
import { teamsTable } from "./teams.sql";
import { templatesTable } from "./templates.sql";
import { usersTable } from "./users.sql";

export const projectsTable = pgTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid(8)),
    name: text("name").notNull(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => usersTable.id),
    teamId: text("team_id")
      .notNull()
      .references(() => teamsTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    creatorIdx: index("projects_creator_idx").on(table.creatorId),
  })
);

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [projectsTable.creatorId],
    references: [usersTable.id],
  }),
  team: one(teamsTable, {
    fields: [projectsTable.teamId],
    references: [teamsTable.id],
  }),
  templates: many(templatesTable),
  images: many(imagesTable),
  domains: many(domainsTable)
}));

export type DbProject = typeof projectsTable.$inferSelect;
