ALTER TABLE "store" ALTER COLUMN "address" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "store" ALTER COLUMN "address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ALTER COLUMN "phone" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "store" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ALTER COLUMN "email" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "store" ALTER COLUMN "email" SET NOT NULL;