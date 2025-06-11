"use server";

import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { bannerSettings, productWheelSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type UpdateCustomisationPayload = {
  customisationId: string;
  storeSlug: string;
  productWheel?: {
    show: boolean;
    circleTime: number;
    productCount: number;
    categoryId: string;
  };
  banner?: {
    show: boolean;
  };
};

export const updateCustomisation = async (
  payload: UpdateCustomisationPayload
) => {
  const session = await serverAuth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    if (payload.productWheel) {
      await db
        .update(productWheelSettings)
        .set({
          ...payload.productWheel,
        })
        .where(
          eq(productWheelSettings.customisationId, payload.customisationId)
        );
    }

    if (payload.banner) {
      await db
        .update(bannerSettings)
        .set({
          ...payload.banner,
        })
        .where(eq(bannerSettings.customisationId, payload.customisationId));
    }

    revalidatePath(`/merchant/stores/${payload.storeSlug}/customise`);
    revalidatePath(`/${payload.storeSlug}`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update customisation" };
  }
};
