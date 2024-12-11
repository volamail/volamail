ALTER TABLE "projects" ALTER COLUMN "default_theme" SET DEFAULT '{"background":"#EEEEEE","contentBackground":"#FFFFFF","contentMaxWidth":600,"contentBorderRadius":2}'::jsonb;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "theme" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "max_domains" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" DROP COLUMN IF EXISTS "receives_delivery_notifications";