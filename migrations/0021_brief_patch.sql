ALTER TABLE "subscriptions" ALTER COLUMN "max_domains" SET DEFAULT 2;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "refills_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "remaining_quota";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "storage_quota";