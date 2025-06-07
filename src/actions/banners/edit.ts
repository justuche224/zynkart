"use server";
import db from "@/db";
import { banner } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { NewBannerSchema } from "@/schemas";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const updateBanner = async (
  bannerId: string,
  values: z.infer<typeof NewBannerSchema>,
  merchantId: string
) => {
  try {
    const session = await serverAuth();

    if (!session?.user?.id || session.user.id !== merchantId) {
      return { error: "Unauthorized" };
    }

    const validationResult = NewBannerSchema.safeParse(values);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const bannerToUpdate = await db.query.banner.findFirst({
      where: and(eq(banner.id, bannerId), eq(banner.storeId, values.storeId)),
      columns: {
        id: true,
      },
    });

    if (!bannerToUpdate) {
      return {
        error: "Banner not found or you don't have permission to edit it.",
      };
    }

    if (!values.imageUrl) {
      return { error: "Image URL is required" };
    }

    await db
      .update(banner)
      .set({
        title: values.title,
        description: values.description,
        linkUrl: values.linkUrl,
        isActive: values.isActive,
        imageUrl: values.imageUrl,
      })
      .where(eq(banner.id, bannerId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update banner" };
  }
};
