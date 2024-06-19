CREATE TABLE IF NOT EXISTS "mail_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "mail_codes_email_unique" UNIQUE("email")
);
