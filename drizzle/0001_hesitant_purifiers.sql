CREATE TABLE "banner_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"show" boolean DEFAULT true NOT NULL,
	"customisation_id" text NOT NULL,
	CONSTRAINT "banner_settings_customisation_id_unique" UNIQUE("customisation_id")
);
--> statement-breakpoint
CREATE TABLE "product_wheel_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"show" boolean DEFAULT true NOT NULL,
	"circle_time" integer DEFAULT 3 NOT NULL,
	"product_count" integer DEFAULT 6 NOT NULL,
	"category_id" text DEFAULT 'all',
	"customisation_id" text NOT NULL,
	CONSTRAINT "product_wheel_settings_customisation_id_unique" UNIQUE("customisation_id")
);
--> statement-breakpoint
ALTER TABLE "customisations" ADD COLUMN "template" text NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "logo_url" text;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'banner_settings_customisation_id_customisations_id_fk') THEN
        ALTER TABLE "banner_settings" ADD CONSTRAINT "banner_settings_customisation_id_customisations_id_fk" FOREIGN KEY ("customisation_id") REFERENCES "public"."customisations"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_wheel_settings_customisation_id_customisations_id_fk') THEN
        ALTER TABLE "product_wheel_settings" ADD CONSTRAINT "product_wheel_settings_customisation_id_customisations_id_fk" FOREIGN KEY ("customisation_id") REFERENCES "public"."customisations"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customisations_unique_template_per_store_idx" ON "customisations" ("store_id","template");