"use server";

import db from "@/db";
import { shippingZone, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";

export const deleteShippingZone = async (
  shippingZoneId: string,
  storeSlug: string,
  merchantId: string
) => {
  try {
    if (!shippingZoneId || !storeSlug || !merchantId)
      return { error: "Missing required fields" };
    const merchant = await serverAuth();
    if (!merchant?.user || merchant.user.id !== merchantId)
      return { error: "Unauthorized access" };

    const storeData = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchantId)),
    });

    if (!storeData) return { error: "Store not found" };

    await db
      .delete(shippingZone)
      .where(
        and(
          eq(shippingZone.id, shippingZoneId),
          eq(shippingZone.storeId, storeData.id)
        )
      );

    return { success: "Shipping zone deleted successfully" };
  } catch (error) {
    console.error(`[DELETE SHIPPING ZONE ACTION ERROR] ${error}`);
    return { error: "Failed to delete shipping zone" };
  }
};
