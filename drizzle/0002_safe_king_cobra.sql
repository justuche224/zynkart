CREATE TYPE "public"."fulfillment_status" AS ENUM('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'PROCESSING' NOT NULL,
	"payment_reference" text NOT NULL,
	"payment_access_code" text NOT NULL,
	"subtotal" integer NOT NULL,
	"total" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"shipping_info" jsonb NOT NULL,
	"tracking_number" text,
	"shipping_provider" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	CONSTRAINT "order_payment_reference_unique" UNIQUE("payment_reference"),
	CONSTRAINT "order_payment_access_code_unique" UNIQUE("payment_access_code")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"store_id" text NOT NULL,
	"variant_id" text,
	"quantity" integer NOT NULL,
	"product_name" text NOT NULL,
	"variant_details" text,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "order_payment_reference_idx" ON "order" USING btree ("payment_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "order_payment_access_code_idx" ON "order" USING btree ("payment_access_code");--> statement-breakpoint
CREATE INDEX "order_store_id_idx" ON "order" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "order_customer_id_idx" ON "order" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "order_payment_status_idx" ON "order" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "order_fulfillment_status_idx" ON "order" USING btree ("fulfillment_status");--> statement-breakpoint
CREATE INDEX "payment_reference_idx" ON "order" USING btree ("payment_reference");--> statement-breakpoint
CREATE INDEX "order_item_order_id_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_id_idx" ON "order_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_item_variant_id_idx" ON "order_item" USING btree ("variant_id");