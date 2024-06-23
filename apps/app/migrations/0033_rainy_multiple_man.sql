ALTER TABLE "media" RENAME TO "images";--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT "media_project_id_projects_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN IF EXISTS "type";