"use server";
import db from "@/db";
import { store, storeSocial } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export const deleteStoreSocial = async (id: string, storeId: string) => {
  try {
    const session = await serverAuth();
    if (!session?.session || !session?.user) {
      throw new Error("Unauthorized");
    }
    const storeInfo = await db
      .select()
      .from(store)
      .where(and(eq(store.id, storeId), eq(store.merchantId, session.user.id)));
    if (!storeInfo) {
      throw new Error("Store not found");
    }
    const social = await db
      .delete(storeSocial)
      .where(and(eq(storeSocial.id, id), eq(storeSocial.storeId, storeId)));
    return social;
  } catch (error) {
    throw new Error("Failed to delete social");
  }
};
