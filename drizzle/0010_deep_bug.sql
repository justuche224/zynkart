ALTER TABLE "store_social" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "store_social" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;