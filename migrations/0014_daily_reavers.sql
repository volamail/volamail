DROP INDEX IF EXISTS "teams_subscription_id_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "team_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN IF EXISTS "subscription_id";