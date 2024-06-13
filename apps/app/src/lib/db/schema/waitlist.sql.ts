import { pgTable, text } from "drizzle-orm/pg-core";

export const waitlistTable = pgTable("waitlist", {
  email: text("email").notNull().primaryKey(),
});
