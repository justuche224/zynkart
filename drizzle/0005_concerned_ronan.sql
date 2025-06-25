CREATE TYPE "public"."feature_key" AS ENUM('stores_count', 'products_count', 'custom_domain', 'email_service', 'zynkart_branding', 'api_mode', 'templates_access');--> statement-breakpoint
CREATE TYPE "public"."limit_type" AS ENUM('count', 'monthly', 'boolean');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('free', 'pro', 'elite');--> statement-breakpoint
CREATE TYPE "public"."reset_period" AS ENUM('daily', 'monthly', 'never');--> statement-breakpoint
CREATE TABLE "feature_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"feature_key" "feature_key" NOT NULL,
	"limit_type" "limit_type" NOT NULL,
	"limit_value" integer NOT NULL,
	"reset_period" "reset_period" DEFAULT 'never' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature_key" "feature_key" NOT NULL,
	"override_value" integer NOT NULL,
	"reason" text NOT NULL,
	"expires_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature_key" "feature_key" NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp DEFAULT now() NOT NULL,
	"reset_date" timestamp NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feature_overrides" ADD CONSTRAINT "feature_overrides_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_overrides" ADD CONSTRAINT "feature_overrides_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_usage" ADD CONSTRAINT "feature_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_limits_plan_feature_idx" ON "feature_limits" USING btree ("plan_type","feature_key");--> statement-breakpoint
CREATE INDEX "feature_limits_plan_type_idx" ON "feature_limits" USING btree ("plan_type");--> statement-breakpoint
CREATE INDEX "feature_limits_feature_key_idx" ON "feature_limits" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "feature_limits_enabled_idx" ON "feature_limits" USING btree ("enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_overrides_user_feature_idx" ON "feature_overrides" USING btree ("user_id","feature_key");--> statement-breakpoint
CREATE INDEX "feature_overrides_user_id_idx" ON "feature_overrides" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_overrides_expires_at_idx" ON "feature_overrides" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_usage_user_feature_idx" ON "feature_usage" USING btree ("user_id","feature_key");--> statement-breakpoint
CREATE INDEX "feature_usage_user_id_idx" ON "feature_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_usage_feature_key_idx" ON "feature_usage" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "feature_usage_reset_date_idx" ON "feature_usage" USING btree ("reset_date");--> statement-breakpoint
CREATE INDEX "user_plans_user_id_idx" ON "user_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_plans_status_idx" ON "user_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_plans_plan_type_idx" ON "user_plans" USING btree ("plan_type");