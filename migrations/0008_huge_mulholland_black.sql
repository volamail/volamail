ALTER TABLE "team_invites" DROP CONSTRAINT "team_invites_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "team_invites" DROP CONSTRAINT "team_invites_team_id_email_pk";--> statement-breakpoint
ALTER TABLE "team_invites" ADD COLUMN "code" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "team_invites" ADD COLUMN "expires_at" timestamp NOT NULL;