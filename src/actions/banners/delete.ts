"use server";

import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";
import { banner, store } from "@/db/schema";

export const deleteBanner = async (bannerId: string, storeSlug: string) => {
  try {
    const user = await serverAuth();
    if (!user?.user?.id) {
      return {
        error: { message: "Authentication required!" },
      };
    }
    const storeInfo = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id)),
      columns: {
        id: true,
      },
    });
    if (!storeInfo) {
      return {
        error: { message: "Store not found or unauthorized." },
      };
    }
    const bannerInfo = await db.query.banner.findFirst({
      where: and(eq(banner.id, bannerId), eq(banner.storeId, storeInfo.id)),
      columns: {
        id: true,
      },
    });
    if (!bannerInfo) {
      return {
        error: { message: "Banner not found or unauthorized." },
      };
    }
    await db.delete(banner).where(eq(banner.id, bannerId));
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: { message: "Failed to delete banner" },
    };
  }
};
