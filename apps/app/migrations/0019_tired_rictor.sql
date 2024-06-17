ALTER TABLE "subscriptions" ALTER COLUMN "period_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "price" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "remaining_quota" integer DEFAULT 0 NOT NULL;