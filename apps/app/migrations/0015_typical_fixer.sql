ALTER TABLE "projects" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "personal_team_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_personal_team_id_teams_id_fk" FOREIGN KEY ("personal_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
