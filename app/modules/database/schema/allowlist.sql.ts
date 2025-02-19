import { pgTable, text } from "drizzle-orm/pg-core";

export const allowlistTable = pgTable("allowlist", {
  email: text("email").notNull().primaryKey(),
});
