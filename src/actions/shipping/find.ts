"use server";

import db from "@/db";
import { shippingZone } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

interface ShippingZoneQuery {
  storeId: string;
  country: string;
  state?: string;
  area?: string;
}

/**
 * Finds the best matching shipping zone with hierarchical fallback
 * Priority: Area > State > Country
 *
 * Example:
 * - If looking for "Nsukka, Enugu, Nigeria"
 * - First tries to find exact match for Nsukka area
 * - If not found, falls back to Enugu state zone
 * - If not found, falls back to Nigeria country zone
 */
export const findShippingZone = async ({
  storeId,
  country,
  state,
  area,
}: ShippingZoneQuery) => {
  try {
    // 1. Try to find exact area match first (most specific)
    if (area && state) {
      const areaZone = await db.query.shippingZone.findFirst({
        where: and(
          eq(shippingZone.storeId, storeId),
          eq(shippingZone.country, country),
          eq(shippingZone.state, state),
          eq(shippingZone.area, area),
          eq(shippingZone.isActive, true)
        ),
      });

      if (areaZone) {
        return {
          success: true,
          zone: areaZone,
          fallbackLevel: "area" as const,
        };
      }
    }

    // 2. Try to find state match (fallback)
    if (state) {
      const stateZone = await db.query.shippingZone.findFirst({
        where: and(
          eq(shippingZone.storeId, storeId),
          eq(shippingZone.country, country),
          eq(shippingZone.state, state),
          isNull(shippingZone.area), // State-level zone (no specific area)
          eq(shippingZone.isActive, true)
        ),
      });

      if (stateZone) {
        return {
          success: true,
          zone: stateZone,
          fallbackLevel: "state" as const,
        };
      }
    }

    // 3. Try to find country match (final fallback)
    const countryZone = await db.query.shippingZone.findFirst({
      where: and(
        eq(shippingZone.storeId, storeId),
        eq(shippingZone.country, country),
        isNull(shippingZone.state), // Country-level zone (no specific state)
        isNull(shippingZone.area), // Country-level zone (no specific area)
        eq(shippingZone.isActive, true)
      ),
    });

    if (countryZone) {
      return {
        success: true,
        zone: countryZone,
        fallbackLevel: "country" as const,
      };
    }

    // 4. No shipping zone found
    return {
      success: false,
      zone: null,
      fallbackLevel: null,
      error: "No shipping zone available for this location",
    };
  } catch (error) {
    console.error("Error finding shipping zone:", error);
    return {
      success: false,
      zone: null,
      fallbackLevel: null,
      error: "Failed to find shipping zone",
    };
  }
};

/**
 * Gets all available shipping zones for a store, organized by hierarchy
 */
export const getStoreShippingZones = async (storeId: string) => {
  try {
    const zones = await db.query.shippingZone.findMany({
      where: and(
        eq(shippingZone.storeId, storeId),
        eq(shippingZone.isActive, true)
      ),
      orderBy: [shippingZone.country, shippingZone.state, shippingZone.area],
    });

    // Group zones by hierarchy
    const organized = {
      countryZones: zones.filter((z) => !z.state && !z.area),
      stateZones: zones.filter((z) => z.state && !z.area),
      areaZones: zones.filter((z) => z.area),
    };

    return {
      success: true,
      zones: organized,
      allZones: zones,
    };
  } catch (error) {
    console.error("Error getting store shipping zones:", error);
    return {
      success: false,
      zones: null,
      allZones: [],
      error: "Failed to get shipping zones",
    };
  }
};
