"use server";

import db from "@/db";
import {
  bannerSettings,
  customisations,
  productWheelSettings,
  store,
} from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { info } from "@/constants";
import { and, eq } from "drizzle-orm";

export const changeTemplate = async (storeId: string, template: string) => {
  try {
    const session = await serverAuth();

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (!info.templates.includes(template)) {
      return { error: "Invalid template" };
    }

    const storeResult = await db
      .select({ id: store.id, currentTemplate: store.template })
      .from(store)
      .where(and(eq(store.id, storeId), eq(store.merchantId, session.user.id)))
      .limit(1);

    if (!storeResult.length) {
      return { error: "Store not found" };
    }

    const { currentTemplate } = storeResult[0];

    if (currentTemplate === template) {
      return { success: "This template is already active." };
    }

    const existingCustomisation = await db
      .select({ id: customisations.id })
      .from(customisations)
      .where(
        and(
          eq(customisations.storeId, storeId),
          eq(customisations.template, template)
        )
      )
      .limit(1);

    // Case 1: Template was used before (customisation data exists)
    // Just switch to the existing template and preserve all settings
    if (existingCustomisation.length > 0) {
      await db
        .update(store)
        .set({ template: template })
        .where(eq(store.id, storeId));
      return { success: "Template updated successfully." };
    } else {
      // Case 2: Template never used before (no customisation data exists)
      // Create new customisation with default settings
      const trx = await db.transaction(async (tx) => {
        await tx
          .update(store)
          .set({ template: template })
          .where(eq(store.id, storeId));

        const newCustomisation = await tx
          .insert(customisations)
          .values({
            storeId: storeId,
            template: template,
          })
          .returning();

        // Initialize default product wheel settings
        await tx.insert(productWheelSettings).values({
          customisationId: newCustomisation[0].id,
          show: true,
          circleTime: 3,
          productCount: 6,
          categoryId: "all",
        });

        // Initialize default banner settings
        await tx.insert(bannerSettings).values({
          customisationId: newCustomisation[0].id,
          show: true,
        });

        return { data: newCustomisation[0] };
      });

      return {
        success: "Template updated and new customisation created.",
        data: trx.data,
      };
    }
  } catch (error) {
    console.error("Failed to change template:", error);
    return { error: "Failed to change template." };
  }
};
