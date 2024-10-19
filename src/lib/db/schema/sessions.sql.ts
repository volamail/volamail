import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users.sql";

export const sessionsTable = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "date",
		}).notNull(),
	},
	(table) => ({
		userIdx: index("sessions_user_id_idx").on(table.userId),
	}),
);
