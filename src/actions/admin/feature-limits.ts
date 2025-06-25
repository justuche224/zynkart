"use server";

import { revalidatePath } from "next/cache";
import { serverAuth } from "@/lib/server-auth";
import {
  FeatureLimitService,
  type FeatureKey,
  type PlanType,
  type FeatureCheckResult,
} from "@/services/feature-limit";

async function requireAdmin() {
  const session = await serverAuth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session;
}

export async function getFeatureLimits() {
  await requireAdmin();

  try {
    const limits = await FeatureLimitService.getAllFeatureLimits();
    return { success: true, data: limits };
  } catch (error) {
    console.error("Error fetching feature limits:", error);
    return { success: false, error: "Failed to fetch feature limits" };
  }
}

export async function upsertFeatureLimit(formData: FormData) {
  await requireAdmin();

  try {
    const planType = formData.get("planType") as PlanType;
    const featureKey = formData.get("featureKey") as FeatureKey;
    const limitType = formData.get("limitType") as
      | "count"
      | "monthly"
      | "boolean";
    const limitValue = parseInt(formData.get("limitValue") as string);
    const resetPeriod =
      (formData.get("resetPeriod") as "daily" | "monthly" | "never") || "never";
    const enabled = formData.get("enabled") === "true";
    const description = (formData.get("description") as string) || undefined;

    await FeatureLimitService.upsertFeatureLimit(
      planType,
      featureKey,
      limitType,
      limitValue,
      resetPeriod,
      enabled,
      description
    );

    revalidatePath("/admin/feature-limits");
    return { success: true, message: "Feature limit updated successfully" };
  } catch (error) {
    console.error("Error upserting feature limit:", error);
    return { success: false, error: "Failed to update feature limit" };
  }
}

export async function deleteFeatureLimit(
  planType: PlanType,
  featureKey: FeatureKey
) {
  await requireAdmin();

  try {
    await FeatureLimitService.deleteFeatureLimit(planType, featureKey);
    revalidatePath("/admin/feature-limits");
    return { success: true, message: "Feature limit deleted successfully" };
  } catch (error) {
    console.error("Error deleting feature limit:", error);
    return { success: false, error: "Failed to delete feature limit" };
  }
}

export async function seedDefaultLimits() {
  await requireAdmin();
  try {
    await FeatureLimitService.seedDefaultLimits();
    revalidatePath("/admin/feature-limits");
    return { success: true, message: "Default limits seeded successfully" };
  } catch (error) {
    console.error("Error seeding default limits:", error);
    return { success: false, error: "Failed to seed default limits" };
  }
}

export async function checkFeatureLimit(
  userId: string,
  featureKey: FeatureKey,
  requestedAmount: number = 1
): Promise<FeatureCheckResult> {
  try {
    return await FeatureLimitService.canUseFeature(
      userId,
      featureKey,
      requestedAmount
    );
  } catch (error) {
    console.error("Error checking feature limit:", error);
    return {
      allowed: false,
      message: "Error checking feature limit",
    };
  }
}

export async function checkFeatureAccess(
  userId: string,
  featureKey: FeatureKey
): Promise<boolean> {
  try {
    return await FeatureLimitService.hasFeatureAccess(userId, featureKey);
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

export async function getCurrentFeatureUsage(
  userId: string,
  featureKey: FeatureKey
): Promise<number> {
  try {
    return await FeatureLimitService.getCurrentUsage(userId, featureKey);
  } catch (error) {
    console.error("Error getting current usage:", error);
    return 0;
  }
}
