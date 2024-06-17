DO $$ BEGIN
 CREATE TYPE "public"."subscription_period_type" AS ENUM('MONTHLY', 'ANNUAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "period_type" "subscription_period_type" DEFAULT 'MONTHLY' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "price" numeric(2, 12) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
