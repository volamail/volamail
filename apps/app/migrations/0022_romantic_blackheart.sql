ALTER TABLE "team_members" ADD COLUMN "join_at" timestamp DEFAULT now() NOT NULL;