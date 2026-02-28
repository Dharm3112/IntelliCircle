CREATE TABLE "auth_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" varchar(45),
	"event_type" varchar(50) NOT NULL,
	"attempted_identity" varchar(256),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
