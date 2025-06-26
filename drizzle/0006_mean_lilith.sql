CREATE TABLE "customer_saved_address" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"label" text NOT NULL,
	"address" text NOT NULL,
	"primary_phone" text NOT NULL,
	"secondary_phone" text,
	"additional_info" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_saved_address" ADD CONSTRAINT "customer_saved_address_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_saved_address_customer_id_idx" ON "customer_saved_address" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_saved_address_default_idx" ON "customer_saved_address" USING btree ("customer_id","is_default");