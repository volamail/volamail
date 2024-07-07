import { ulid } from "ulid";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { usersTable } from "./users.sql";
import { projectsTable } from "./projects.sql";

export const apiTokensTable = pgTable(
  "api_tokens",
  {
    id: text("id").primaryKey().$defaultFn(ulid),
    token: text("token").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, {
        onDelete: "cascade",
      }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => usersTable.id),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => ({
    projectIdx: index("api_tokens_project_id_idx").on(table.projectId),
    creatorIdx: index("api_tokens_creator_id_idx").on(table.creatorId),
  })
);

export const apiTokensRelations = relations(apiTokensTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [apiTokensTable.projectId],
    references: [projectsTable.id],
  }),
  creator: one(usersTable, {
    fields: [apiTokensTable.creatorId],
    references: [usersTable.id],
  }),
}));
