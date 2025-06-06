CREATE TYPE "public"."shipping_zone_type" AS ENUM('COUNTRY', 'STATE', 'AREA');--> statement-breakpoint
CREATE TABLE "shipping_condition" (
	"id" text PRIMARY KEY NOT NULL,
	"shipping_zone_id" text NOT NULL,
	"min_weight" integer,
	"max_weight" integer,
	"additional_cost" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_zone" (
	"id" text PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"area" text,
	"zone_type" "shipping_zone_type" NOT NULL,
	"shipping_cost" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"min_order_amount" integer,
	"max_order_amount" integer,
	"estimated_days" integer,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipping_condition" ADD CONSTRAINT "shipping_condition_shipping_zone_id_shipping_zone_id_fk" FOREIGN KEY ("shipping_zone_id") REFERENCES "public"."shipping_zone"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_zone" ADD CONSTRAINT "shipping_zone_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shipping_condition_zone_id_idx" ON "shipping_condition" USING btree ("shipping_zone_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_zone_location_idx" ON "shipping_zone" USING btree ("store_id","country","state","area");--> statement-breakpoint
CREATE INDEX "shipping_zone_store_id_idx" ON "shipping_zone" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "shipping_zone_country_idx" ON "shipping_zone" USING btree ("country");