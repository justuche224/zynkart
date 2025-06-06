"use server";
import { serverAuth } from "@/lib/server-auth";
import { ShipingZoneSchema } from "@/schemas";
import db from "@/db";
import { shippingZone, store } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

const getZoneType = (values: z.infer<typeof ShipingZoneSchema>) => {
  if (values.area) return "AREA";
  if (values.state) return "STATE";
  return "COUNTRY";
};

export const createShipingZone = async (
  values: z.infer<typeof ShipingZoneSchema>,
  merchantId: string,
  storeSlug: string
) => {
  try {
    const user = await serverAuth();
    if (!user?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
        data: null,
      };
    }

    if (user.user.id !== merchantId) {
      return {
        success: false,
        error: { message: "Unauthorized access." },
        data: null,
      };
    }

    const validationResult = ShipingZoneSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: { message: validationResult.error.errors[0].message },
        data: null,
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
        data: null,
      };
    }

    // Check for exact duplicate zones (same country, state, and area combination)
    // This allows hierarchical zones: state-level zones can coexist with area-level zones
    // State-level zones act as fallbacks for areas not specifically listed
    const existingZone = await db.query.shippingZone.findFirst({
      where: and(
        eq(shippingZone.storeId, storeData.id),
        eq(shippingZone.country, values.country),
        values.state
          ? eq(shippingZone.state, values.state)
          : isNull(shippingZone.state),
        values.area
          ? eq(shippingZone.area, values.area)
          : isNull(shippingZone.area)
      ),
    });

    if (existingZone) {
      return {
        success: false,
        error: {
          message:
            "A shipping zone for this exact location already exists. Please visit the shipping zones page to update it if needed.",
        },
        data: null,
      };
    }

    const newShippingZone = await db
      .insert(shippingZone)
      .values({
        country: values.country,
        state: values.state,
        area: values.area,
        storeId: storeData.id,
        shippingCost: values.shippingCost || 0,
        zoneType: getZoneType(values),
      })
      .returning();

    if (!newShippingZone.length) {
      throw new Error("Failed to create shipping zone.");
    }

    return {
      success: true,
      error: null,
      data: newShippingZone[0],
    };
  } catch (error) {
    console.error("Shipping zone creation error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create shipping zone.",
      },
      data: null,
    };
  }
};
