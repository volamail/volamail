import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

import { teamsTable } from "./teams.sql";

export const addressesTable = pgTable("addresses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(16)),
  address: text("address").notNull(),
  verified: boolean("verified").notNull().default(false),
  teamId: text("team_id")
    .notNull()
    .references(() => teamsTable.id, {
      onDelete: "cascade",
    }),
});

export const addressesRelations = relations(addressesTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [addressesTable.teamId],
    references: [teamsTable.id],
  }),
}));
