import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { teamMembersTable } from "./teams.sql";

export const usersTable = pgTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	emailVerified: boolean("email_verified").notNull(),
	name: text("name").notNull(),
	githubId: integer("github_id"),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	teams: many(teamMembersTable),
}));

export type DbUser = InferSelectModel<typeof usersTable>;
