CREATE TYPE "public"."product_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."shipping_zone_type" AS ENUM('COUNTRY', 'STATE', 'AREA');--> statement-breakpoint
CREATE TYPE "public"."weight_unit" AS ENUM('GRAM', 'KILOGRAM', 'POUND', 'OUNCE', 'LITER');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
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
	"store_id" text NOT NULL,
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
	"image_url" text,
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
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"image" text,
	"password" text NOT NULL,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_saved_product" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"customer_id" text NOT NULL,
	CONSTRAINT "customer_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "customisations" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
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
CREATE TABLE "product_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
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
CREATE TABLE "size" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"store_profile_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"template" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"description" text,
	CONSTRAINT "store_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "store_social" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"normalized_email" text,
	"role" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_normalized_email_unique" UNIQUE("normalized_email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank" ADD CONSTRAINT "bank_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banner" ADD CONSTRAINT "banner_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color" ADD CONSTRAINT "color_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_saved_product" ADD CONSTRAINT "customer_saved_product_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_saved_product" ADD CONSTRAINT "customer_saved_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_session" ADD CONSTRAINT "customer_session_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customisations" ADD CONSTRAINT "customisations_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_source" ADD CONSTRAINT "product_source_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag" ADD CONSTRAINT "product_tag_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag" ADD CONSTRAINT "product_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_size_id_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."size"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_video" ADD CONSTRAINT "product_video_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_weight" ADD CONSTRAINT "product_weight_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_condition" ADD CONSTRAINT "shipping_condition_shipping_zone_id_shipping_zone_id_fk" FOREIGN KEY ("shipping_zone_id") REFERENCES "public"."shipping_zone"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_zone" ADD CONSTRAINT "shipping_zone_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size" ADD CONSTRAINT "size_store_profile_id_store_id_fk" FOREIGN KEY ("store_profile_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_merchant_id_user_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_social" ADD CONSTRAINT "store_social_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banner_store_profile_id_idx" ON "banner" USING btree ("store_profile_id");--> statement-breakpoint
CREATE INDEX "banner_position_idx" ON "banner" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_name_store_profile_id_idx" ON "category" USING btree ("name","store_id");--> statement-breakpoint
CREATE INDEX "product_category_store_profile_id_idx" ON "category" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "color_name_store_profile_id_idx" ON "color" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE INDEX "color_store_profile_id_idx" ON "color" USING btree ("store_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_saved_product_unique_idx" ON "customer_saved_product" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "customer_saved_product_customer_id_idx" ON "customer_saved_product" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_saved_product_product_id_idx" ON "customer_saved_product" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "domain_store_id_idx" ON "domain" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "product_image_product_id_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_image_position_idx" ON "product_image" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "product_source_name_store_profile_id_idx" ON "product_source" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_source_slug_store_profile_id_idx" ON "product_source" USING btree ("slug","store_profile_id");--> statement-breakpoint
CREATE INDEX "product_source_store_profile_id_idx" ON "product_source" USING btree ("store_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_tag_unique_idx" ON "product_tag" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE INDEX "product_tag_product_id_idx" ON "product_tag" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_tag_tag_id_idx" ON "product_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "product_variant_product_id_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_color_id_idx" ON "product_variant" USING btree ("color_id");--> statement-breakpoint
CREATE INDEX "product_variant_size_id_idx" ON "product_variant" USING btree ("size_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_unique_combination_idx" ON "product_variant" USING btree ("product_id","color_id","size_id");--> statement-breakpoint
CREATE INDEX "product_video_product_id_idx" ON "product_video" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_video_position_idx" ON "product_video" USING btree ("position");--> statement-breakpoint
CREATE INDEX "product_weight_product_id_idx" ON "product_weight" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "shipping_condition_zone_id_idx" ON "shipping_condition" USING btree ("shipping_zone_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_zone_location_idx" ON "shipping_zone" USING btree ("store_id","country","state","area");--> statement-breakpoint
CREATE INDEX "shipping_zone_store_id_idx" ON "shipping_zone" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "shipping_zone_country_idx" ON "shipping_zone" USING btree ("country");--> statement-breakpoint
CREATE UNIQUE INDEX "size_name_store_profile_id_idx" ON "size" USING btree ("name","store_profile_id");--> statement-breakpoint
CREATE INDEX "size_store_profile_id_idx" ON "size" USING btree ("store_profile_id");--> statement-breakpoint
CREATE INDEX "store_slug_idx" ON "store" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "store_merchant_id_idx" ON "store" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "store_name_idx" ON "store" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_name_store_id_idx" ON "tag" USING btree ("name","store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_slug_store_id_idx" ON "tag" USING btree ("slug","store_id");--> statement-breakpoint
CREATE INDEX "tag_store_id_idx" ON "tag" USING btree ("store_id");