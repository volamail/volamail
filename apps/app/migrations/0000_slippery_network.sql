CREATE TABLE IF NOT EXISTS "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL
);
