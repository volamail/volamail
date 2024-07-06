ALTER TYPE "subscription_status" ADD VALUE 'CANCELED';--> statement-breakpoint
ALTER TYPE "subscription_tier" ADD VALUE 'CUSTOM';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "storage_quota" integer DEFAULT 20000 NOT NULL;