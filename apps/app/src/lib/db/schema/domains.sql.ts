import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { projectsTable } from "./projects.sql";

export const domainsTable = pgTable(
	"domains",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(16)),
		domain: text("address").notNull(),
		verified: boolean("verified").notNull().default(false),
		tokens: text("tokens").array().notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		receivesDeliveryNotifications: boolean("receives_delivery_notifications")
			.notNull()
			.default(false),
		projectId: text("project_id")
			.notNull()
			.references(() => projectsTable.id, {
				onDelete: "cascade",
			}),
	},
	(table) => ({
		projectIdx: index("domains_project_id_idx").on(table.projectId),
	}),
);

export const domainsRelations = relations(domainsTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [domainsTable.projectId],
		references: [projectsTable.id],
	}),
}));
