import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { usersTable } from "./users.sql";
import { projectsTable } from "./projects.sql";
import { addressesTable } from "./addresses.sql";
import { subscriptionsTable } from "./subscriptions.sql";

export const teamsTable = pgTable("teams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(8)),
  name: text("name").notNull(),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscriptionsTable.id),
});

export const teamMembersTable = pgTable(
  "team_members",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teamsTable.id, {
        onDelete: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.teamId, table.userId],
    }),
  })
);

export const teamsRelations = relations(teamsTable, ({ many, one }) => ({
  projects: many(projectsTable),
  members: many(teamMembersTable),
  addresses: many(addressesTable),
  personalTeamOwner: one(usersTable),
  subscription: one(subscriptionsTable, {
    fields: [teamsTable.subscriptionId],
    references: [subscriptionsTable.id],
  }),
}));

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [teamMembersTable.teamId],
    references: [teamsTable.id],
  }),
  user: one(usersTable, {
    fields: [teamMembersTable.userId],
    references: [usersTable.id],
  }),
}));

export type DbTeam = typeof teamsTable.$inferSelect;
