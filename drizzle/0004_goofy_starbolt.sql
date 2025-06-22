CREATE INDEX "category_name_search_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE INDEX "customer_store_name_idx" ON "customer" USING btree ("store_id","name");--> statement-breakpoint
CREATE INDEX "customer_store_email_idx" ON "customer" USING btree ("store_id","email");--> statement-breakpoint
CREATE INDEX "customer_name_search_idx" ON "customer" USING btree ("name");--> statement-breakpoint
CREATE INDEX "customer_email_search_idx" ON "customer" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customer_store_created_idx" ON "customer" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "order_store_payment_ref_idx" ON "order" USING btree ("store_id","payment_reference");--> statement-breakpoint
CREATE INDEX "order_store_created_idx" ON "order" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "product_store_status_idx" ON "product" USING btree ("store_profile_id","status");--> statement-breakpoint
CREATE INDEX "product_store_name_idx" ON "product" USING btree ("store_profile_id","name");--> statement-breakpoint
CREATE INDEX "product_name_search_idx" ON "product" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_description_search_idx" ON "product" USING btree ("description");--> statement-breakpoint
CREATE INDEX "product_meta_search_idx" ON "product" USING btree ("meta_title","meta_keywords");--> statement-breakpoint
CREATE INDEX "product_image_default_idx" ON "product_image" USING btree ("product_id","is_default");--> statement-breakpoint
CREATE INDEX "product_tag_composite_idx" ON "product_tag" USING btree ("tag_id","product_id");--> statement-breakpoint
CREATE INDEX "tag_name_search_idx" ON "tag" USING btree ("name");