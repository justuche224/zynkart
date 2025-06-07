"use server";
import db from "@/db";
import { banner, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { NewBannerSchema } from "@/schemas";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const createBanner = async (
  values: z.infer<typeof NewBannerSchema>,
  merchantId: string,
  storeId: string
) => {
  try {
    const session = await serverAuth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const storeInfo = await db.query.store.findFirst({
      where: and(eq(store.id, storeId), eq(store.merchantId, merchantId)),
      columns: {
        id: true,
      },
    });

    if (!storeInfo) {
      return { error: "Store not found" };
    }

    const validationResult = NewBannerSchema.safeParse(values);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    if (!values.imageUrl) {
      return { error: "Image URL is required" };
    }

    await db.insert(banner).values({
      title: values.title,
      description: values.description,
      linkUrl: values.linkUrl,
      isActive: values.isActive,
      storeId: storeInfo.id,
      imageUrl: values.imageUrl,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create banner" };
  }
};
