import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const domainsTable = pgTable("domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  domain: text("address").notNull(),
  verified: boolean("verified").notNull().default(false),
  tokens: text("tokens").array().notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id),
});

export const domainsRelations = relations(domainsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [domainsTable.projectId],
    references: [projectsTable.id],
  }),
}));
