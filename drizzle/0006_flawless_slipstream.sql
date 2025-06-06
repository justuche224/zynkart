ALTER TABLE "bank" RENAME COLUMN "store_profile_id" TO "store_id";--> statement-breakpoint
ALTER TABLE "bank" DROP CONSTRAINT "bank_store_profile_id_store_id_fk";
--> statement-breakpoint
ALTER TABLE "bank" ADD CONSTRAINT "bank_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;