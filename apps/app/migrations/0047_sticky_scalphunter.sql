ALTER TYPE "email_status" ADD VALUE 'COMPLAINED';--> statement-breakpoint
ALTER TABLE "emails" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;