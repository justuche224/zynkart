"use server";

import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import {
  bannerSettings,
  category,
  customisations,
  productWheelSettings,
  store,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const getCustomisation = async (storeId: string) => {
  const session = await serverAuth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const storeInfo = await db.query.store.findFirst({
      where: and(eq(store.id, storeId), eq(store.merchantId, session.user.id)),
      columns: { id: true, template: true },
    });

    if (!storeInfo) {
      throw new Error("Store not found or Unauthorized");
    }

    const categories = await db.query.category.findMany({
      where: eq(category.storeId, storeInfo.id),
      columns: {
        id: true,
        name: true,
      },
    });

    const customisationData = await db.query.customisations.findFirst({
      where: and(
        eq(customisations.storeId, storeInfo.id),
        eq(customisations.template, storeInfo.template)
      ),
      with: {
        productWheelSettings: true,
        bannerSettings: true,
      },
    });

    if (!customisationData && storeInfo.template === "default") {
      //  initialize customisation with default template
      const trx = await db.transaction(async (tx) => {
        const newCustomisation = await tx
          .insert(customisations)
          .values({
            storeId: storeInfo.id,
            template: storeInfo.template,
          })
          .returning();

        const productWheelSettingsData = await tx
          .insert(productWheelSettings)
          .values({
            customisationId: newCustomisation[0].id,
            show: true,
            circleTime: 3,
            productCount: 6,
            categoryId: "all",
          })
          .returning();

        const bannerSettingsData = await tx
          .insert(bannerSettings)
          .values({
            customisationId: newCustomisation[0].id,
            show: true,
          })
          .returning();

        return {
          data: {
            ...newCustomisation[0],
            productWheelSettings: productWheelSettingsData[0],
            bannerSettings: bannerSettingsData[0],
          },
        };
      });

      return { ...trx, categories };
    }

    if (!customisationData) {
      throw new Error("Customisation not found");
    }

    return { data: customisationData, categories };
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get customisation"
    );
  }
};
