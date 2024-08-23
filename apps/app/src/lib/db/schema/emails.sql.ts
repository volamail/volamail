import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const emailStatus = pgEnum("email_status", [
  "SENT",
  "DELIVERED",
  "BOUNCED",
  "COMPLAINED",
]);

export const emailsTable = pgTable(
  "emails",
  {
    id: text("id").notNull().primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    from: text("from").notNull(),
    subject: text("subject").notNull(),
    to: text("to").notNull(),
    status: emailStatus("status").notNull(),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("emails_project_id_idx").on(table.projectId),
  })
);
