"use server";

import db from "@/db";
import { category, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export const deleteCategory = async (
  categoryId: string,
  storeSlug: string,
  merchantId: string
) => {
  try {
    if (!categoryId || !storeSlug || !merchantId)
      return { error: "Missing required fields" };
    const merchant = await serverAuth();

    if (!merchant?.user || merchant.user.id !== merchantId)
      return { error: "Unauthorized access" };

    const storeData = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchantId)),
      columns: {
        id: true,
      },
    });

    if (!storeData) return { error: "Store not found" };

    await db
      .delete(category)
      .where(
        and(
          eq(category.id, categoryId),
          eq(category.storeId, storeData.id)
        )
      );

    return { success: "Category deleted successfully" };
  } catch (error) {
    console.error(`[DELETE CATEGORY ACTION ERROR] ${error}`);
    return { error: "Failed to delete category" };
  }
};
