CREATE TABLE "customer_saved_product" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_saved_product" ADD CONSTRAINT "customer_saved_product_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_saved_product" ADD CONSTRAINT "customer_saved_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_saved_product_unique_idx" ON "customer_saved_product" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "customer_saved_product_customer_id_idx" ON "customer_saved_product" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_saved_product_product_id_idx" ON "customer_saved_product" USING btree ("product_id");