"use server";

import  db  from "@/db";
import { and, eq } from "drizzle-orm";
import { bank, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";

export const deleteBank = async (id: string, storeSlug: string) => {
  if (!id || !storeSlug)
    return {
      success: false,
      error: { message: "Missing required fields!" },
    };
  try {
    const user = await serverAuth();
    if (!user?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
      };
    }

    const storeData = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id)),
      columns: {
        id: true,
        merchantId: true,
      },
    });

    if (!storeData) {
      return {
        success: false,
        error: { message: "Store not found or unauthorized." },
      };
    }

    await db
      .delete(bank)
      .where(
        and(eq(bank.id, id), eq(bank.storeId, storeData.id))
      );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Bank creation error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete bank.",
      },
    };
  }
};
