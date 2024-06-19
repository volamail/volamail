import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const mailCodesTable = pgTable("mail_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  email: text("email").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
});
