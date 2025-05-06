CREATE TYPE "public"."product_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."weight_unit" AS ENUM('GRAM', 'KILOGRAM', 'POUND', 'OUNCE', 'LITER');--> statement-breakpoint
CREATE TABLE "bank" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_code" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text NOT NULL,
	"country" text NOT NULL,
	"currency" text NOT NULL,
	"business_name" text NOT NULL,
	"percentage_charge" numeric NOT NULL,
	"subaccount_code" text NOT NULL,
	"store_profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bank_subaccount_code_unique" UNIQUE("subaccount_code")
);
--> statement-breakpoint
CREATE TABLE "banner" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"image_url" text NOT NULL,
	"link_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"store_profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"store_profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"store_id" text NOT NULL,
	CONSTRAINT "domain_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"status" "product_status" DEFAULT 'ACTIVE' NOT NULL,
	"category_id" text NOT NULL,
	"price" integer NOT NULL,
	"slashed_from" integer,
	"track_quantity" boolean DEFAULT false NOT NULL,
	"in_stock" integer NOT NULL,
	"product_source_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" text,
	"meta_image" text,
	"store_profile_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_source" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"store_profile_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"color_id" text,
	"size_id" text,
	"sku" text,
	"price" integer,
	"in_stock" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_video" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"thumbnail" text,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"value" integer NOT NULL,
	"unit" "weight_unit" NOT NULL,
	"display_value" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_weight_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "size" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"store_profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank" ADD CONSTRAINT "bank_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banner" ADD CONSTRAINT "banner_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color" ADD CONSTRAINT "color_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_source" ADD CONSTRAINT "product_source_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_size_id_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."size"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_video" ADD CONSTRAINT "product_video_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_weight" ADD CONSTRAINT "product_weight_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size" ADD CONSTRAINT "size_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banner_store_profile_id_idx" ON "banner" USING btree ("store_profile_id");--> statement-breakpoint
CREATE INDEX "banner_position_idx" ON "banner" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_name_store_profile_id_idx" ON "category" USING btree ("name","store_id");--> statement-breakpoint
CREATE INDEX "product_category_store_profile_id_idx" ON "category" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "color_name_store_profile_id_idx" ON "color" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE INDEX "color_store_profile_id_idx" ON "color" USING btree ("store_profile_id");--> statement-breakpoint
CREATE INDEX "domain_store_id_idx" ON "domain" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "product_image_product_id_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_image_position_idx" ON "product_image" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "product_source_name_store_profile_id_idx" ON "product_source" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_source_slug_store_profile_id_idx" ON "product_source" USING btree ("slug","store_profile_id");--> statement-breakpoint
CREATE INDEX "product_source_store_profile_id_idx" ON "product_source" USING btree ("store_profile_id");--> statement-breakpoint
CREATE INDEX "product_variant_product_id_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_color_id_idx" ON "product_variant" USING btree ("color_id");--> statement-breakpoint
CREATE INDEX "product_variant_size_id_idx" ON "product_variant" USING btree ("size_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_unique_combination_idx" ON "product_variant" USING btree ("product_id","color_id","size_id");--> statement-breakpoint
CREATE INDEX "product_video_product_id_idx" ON "product_video" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_video_position_idx" ON "product_video" USING btree ("position");--> statement-breakpoint
CREATE INDEX "product_weight_product_id_idx" ON "product_weight" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "size_name_store_profile_id_idx" ON "size" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE INDEX "size_store_profile_id_idx" ON "size" USING btree ("store_profile_id");