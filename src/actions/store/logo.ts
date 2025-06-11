"use server";

import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";

export const updateStoreLogo = async (storeId: string, logoUrl: string) => {
  try {
    const session = await serverAuth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const storeInfo = await db.query.store.findFirst({
      where: and(eq(store.id, storeId), eq(store.merchantId, session.user.id)),
    });

    if (!storeInfo) {
      return { error: "Store not found or Unauthorized" };
    }

    await db.update(store).set({ logoUrl }).where(eq(store.id, storeId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update store logo" };
  }
};

export const deleteStoreLogo = async (storeId: string) => {
  try {
    const session = await serverAuth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const storeInfo = await db.query.store.findFirst({
      where: and(eq(store.id, storeId), eq(store.merchantId, session.user.id)),
    });

    if (!storeInfo) {
      return { error: "Store not found or Unauthorized" };
    }

    await db.update(store).set({ logoUrl: null }).where(eq(store.id, storeId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete store logo" };
  }
};
