DO $$ BEGIN
 CREATE TYPE "public"."email_status" AS ENUM('SENT', 'DELIVERED', 'BOUNCED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emails" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"to" text NOT NULL,
	"status" "email_status" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emails" ADD CONSTRAINT "emails_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emails_project_id_idx" ON "emails" ("project_id");