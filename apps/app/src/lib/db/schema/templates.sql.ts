import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const templatesTable = pgTable("templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(8)),
  slug: text("slug").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const templatesRelations = relations(templatesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [templatesTable.projectId],
    references: [projectsTable.id],
  }),
}));
