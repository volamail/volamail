import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const imagesTable = pgTable("images", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  dimensions: text("dimensions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
});

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [imagesTable.projectId],
    references: [projectsTable.id],
  }),
}));
