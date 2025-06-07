CREATE TABLE "store_social" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_social" ADD CONSTRAINT "store_social_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;