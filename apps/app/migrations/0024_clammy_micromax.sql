CREATE TABLE IF NOT EXISTS "team_invites" (
	"team_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_invites_team_id_email_pk" PRIMARY KEY("team_id","email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
