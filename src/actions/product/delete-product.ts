"use server";

import db from "@/db";
import { product, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";

export const deleteProduct = async (
  productId: string,
  storeSlug: string,
  merchantId: string
) => {
  try {
    if (!productId || !storeSlug || !merchantId)
      return { error: "Missing required fields" };

    const session = await serverAuth();
    const merchant = session?.user;

    if (!merchant?.id || merchant.id !== merchantId)
      return { error: "Unauthorized access" };

    const storeData = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchantId)),
      columns: {
        id: true,
      },
    });

    if (!storeData) return { error: "Store not found" };

    await db
      .delete(product)
      .where(and(eq(product.id, productId), eq(product.storeId, storeData.id)));

    return { success: "Product deleted successfully" };
  } catch (error) {
    console.error(`[DELETE PRODUCT ACTION ERROR] ${error}`);
    return { error: "Failed to delete product" };
  }
};
