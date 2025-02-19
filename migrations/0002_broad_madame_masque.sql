ALTER TABLE "templates" ADD COLUMN "default_translation_language" "template_languages" NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates" ADD CONSTRAINT "templates_team_id_project_id_slug_default_translation_language_template_translations_team_id_project_id_template_slug_language_fk" FOREIGN KEY ("team_id","project_id","slug","default_translation_language") REFERENCES "public"."template_translations"("team_id","project_id","template_slug","language") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
