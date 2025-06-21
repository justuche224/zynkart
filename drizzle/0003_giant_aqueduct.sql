CREATE TABLE "store_visit" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"store_slug" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_visit" ADD CONSTRAINT "store_visit_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_visit_store_id_idx" ON "store_visit" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "store_visit_store_slug_idx" ON "store_visit" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "store_visit_created_at_idx" ON "store_visit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "store_visit_country_idx" ON "store_visit" USING btree ("country");--> statement-breakpoint
CREATE INDEX "store_visit_device_idx" ON "store_visit" USING btree ("device");