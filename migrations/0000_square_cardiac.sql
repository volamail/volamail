CREATE TYPE "public"."email_status" AS ENUM('SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED');--> statement-breakpoint
CREATE TYPE "public"."subscription_period_type" AS ENUM('MONTHLY', 'ANNUAL');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELED', 'PAST_DUE');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('FREE', 'PRO', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."template_languages" AS ENUM('en', 'it', 'fr', 'es', 'de');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domains" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"tokens" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"receives_delivery_notifications" boolean DEFAULT false NOT NULL,
	"team_id" text NOT NULL,
	"project_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emails" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"from" text NOT NULL,
	"subject" text NOT NULL,
	"to" text NOT NULL,
	"status" "email_status" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"language" "template_languages" DEFAULT 'en' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"dimensions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" text NOT NULL,
	"project_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" text,
	CONSTRAINT "mail_codes_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" text NOT NULL,
	"name" text NOT NULL,
	"context" text,
	"default_theme" jsonb DEFAULT '{"background":"#eeeeee","contentBackground":"#ffffff","contentMaxWidth":"600px","contentBorderRadius":2}'::jsonb NOT NULL,
	"default_template_language" "template_languages" DEFAULT 'en' NOT NULL,
	"team_id" text NOT NULL,
	CONSTRAINT "projects_id_team_id_pk" PRIMARY KEY("id","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text,
	"tier" "subscription_tier" NOT NULL,
	"renews_at" timestamp NOT NULL,
	"status" "subscription_status" NOT NULL,
	"monthly_quota" integer NOT NULL,
	"remaining_quota" integer NOT NULL,
	"last_refilled_at" timestamp NOT NULL,
	"period_type" "subscription_period_type" NOT NULL,
	"storage_quota" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_invites" (
	"team_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_invites_team_id_email_pk" PRIMARY KEY("team_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subscription_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "templates" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"slug" text NOT NULL,
	"theme" jsonb DEFAULT '{"background":"#eeeeee","contentBackground":"#ffffff","contentMaxWidth":"600px","contentBorderRadius":2}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_team_id_project_id_slug_pk" PRIMARY KEY("team_id","project_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "template_translations" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"template_slug" text NOT NULL,
	"language" "template_languages" NOT NULL,
	"subject" text NOT NULL,
	"contents" jsonb NOT NULL,
	CONSTRAINT "template_translations_team_id_project_id_template_slug_language_pk" PRIMARY KEY("team_id","project_id","template_slug","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"github_id" integer,
	"personal_team_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_team_id_project_id_projects_team_id_id_fk" FOREIGN KEY ("team_id","project_id") REFERENCES "public"."projects"("team_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "domains" ADD CONSTRAINT "domains_team_id_project_id_projects_team_id_id_fk" FOREIGN KEY ("team_id","project_id") REFERENCES "public"."projects"("team_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emails" ADD CONSTRAINT "emails_team_id_project_id_projects_team_id_id_fk" FOREIGN KEY ("team_id","project_id") REFERENCES "public"."projects"("team_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_team_id_project_id_projects_team_id_id_fk" FOREIGN KEY ("team_id","project_id") REFERENCES "public"."projects"("team_id","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mail_codes" ADD CONSTRAINT "mail_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_translations" ADD CONSTRAINT "template_translations_team_id_project_id_template_slug_templates_team_id_project_id_slug_fk" FOREIGN KEY ("team_id","project_id","template_slug") REFERENCES "public"."templates"("team_id","project_id","slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_personal_team_id_teams_id_fk" FOREIGN KEY ("personal_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_tokens_creator_id_idx" ON "api_tokens" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_codes_user_idx" ON "mail_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teams_subscription_id_idx" ON "teams" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_personal_team_id_idx" ON "users" USING btree ("personal_team_id");