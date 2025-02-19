ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_creator_id_users_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "api_tokens_creator_id_idx";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN IF EXISTS "creator_id";