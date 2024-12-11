import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { usersTable } from "./users.sql";

export const mailCodesTable = pgTable(
	"mail_codes",
	{
		id: serial("id").primaryKey(),
		code: text("code").notNull(),
		email: text("email").notNull().unique(),
		expiresAt: timestamp("expires_at").notNull(),
		userId: text("user_id").references(() => usersTable.id),
	},
	(table) => ({
		userIdx: index("mail_codes_user_idx").on(table.userId),
	}),
);

export const mailCodesRelations = relations(mailCodesTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [mailCodesTable.userId],
		references: [usersTable.id],
	}),
}));
