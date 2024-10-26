ALTER TYPE "public"."template_languages" ADD VALUE 'fr';--> statement-breakpoint
ALTER TYPE "public"."template_languages" ADD VALUE 'es';--> statement-breakpoint
ALTER TYPE "public"."template_languages" ADD VALUE 'de';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "default_theme" SET DEFAULT '{"background":"#eeeeee","contentBackground":"#ffffff","contentMaxWidth":"600px","contentBorderRadius":2}'::jsonb;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "theme" SET DEFAULT '{"background":"#eeeeee","contentBackground":"#ffffff","contentMaxWidth":"600px","contentBorderRadius":2}'::jsonb;