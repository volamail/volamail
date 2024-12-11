ALTER TABLE "users" DROP CONSTRAINT "users_personal_team_id_teams_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_personal_team_id_teams_id_fk" FOREIGN KEY ("personal_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
