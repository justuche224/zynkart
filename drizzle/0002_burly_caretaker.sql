CREATE TABLE "store" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"template" text NOT NULL,
	CONSTRAINT "store_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_merchant_id_user_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_slug_idx" ON "store" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "store_merchant_id_idx" ON "store" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "store_name_idx" ON "store" USING btree ("name");