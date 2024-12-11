ALTER TABLE "teams" DROP CONSTRAINT "teams_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN IF EXISTS "subscription_id";