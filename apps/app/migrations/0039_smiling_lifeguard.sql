CREATE INDEX IF NOT EXISTS "api_tokens_project_id_idx" ON "api_tokens" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_tokens_creator_id_idx" ON "api_tokens" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "domains_project_id_idx" ON "domains" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_project_id_idx" ON "images" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_team_id_idx" ON "projects" ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teams_subscription_id_idx" ON "teams" ("subscription_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_project_id_idx" ON "templates" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_personal_team_id_idx" ON "users" ("personal_team_id");