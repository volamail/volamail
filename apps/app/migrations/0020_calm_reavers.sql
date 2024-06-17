ALTER TABLE "addresses" RENAME TO "domains";--> statement-breakpoint
ALTER TABLE "domains" RENAME COLUMN "team_id" TO "project_id";--> statement-breakpoint
ALTER TABLE "domains" DROP CONSTRAINT "addresses_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "remaining_quota" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domains" ADD CONSTRAINT "domains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
