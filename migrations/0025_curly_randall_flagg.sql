ALTER TABLE "users" DROP CONSTRAINT "users_personal_team_id_teams_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "users_personal_team_id_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "personal_team_id";