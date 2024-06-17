DO $$ BEGIN
 CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELLED', 'PAST_DUE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_tier" AS ENUM('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text,
	"tier" "subscription_tier" NOT NULL,
	"renews_at" timestamp NOT NULL,
	"status" "subscription_status" NOT NULL,
	"monthly_quota" integer NOT NULL,
	"last_refilled_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "subscription_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
