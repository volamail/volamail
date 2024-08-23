ALTER TABLE "emails" ADD COLUMN "from" text DEFAULT 'noreply@volamail.com' NOT NULL;--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "subject" text DEFAULT 'No subject' NOT NULL;