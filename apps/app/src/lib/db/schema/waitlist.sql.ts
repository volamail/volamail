import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const waitlistTable = pgTable("waitlist", {
  email: text("email").notNull().primaryKey(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
