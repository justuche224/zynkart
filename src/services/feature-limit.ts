import "server-only";
import { eq, and, sql, desc } from "drizzle-orm";
import db from "@/db";
import {
  userPlans,
  featureLimits,
  featureUsage,
  featureOverrides,
  user,
  store,
  product,
} from "@/db/schema";

export type FeatureKey =
  | "stores_count"
  | "products_count"
  | "custom_domain"
  | "email_service"
  | "zynkart_branding"
  | "api_mode"
  | "templates_access";

export type PlanType = "free" | "pro" | "elite";

export type LimitType = "count" | "monthly" | "boolean";

export type ResetPeriod = "daily" | "monthly" | "never";

export interface FeatureLimit {
  id: string;
  planType: PlanType;
  featureKey: FeatureKey;
  limitType: LimitType;
  limitValue: number;
  resetPeriod: ResetPeriod;
  enabled: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureCheckResult {
  allowed: boolean;
  limit?: number;
  current?: number;
  unlimited?: boolean;
  message?: string;
  upgradeRequired?: boolean;
  suggestedPlan?: PlanType;
}

export interface FeatureUsageRecord {
  id: string;
  userId: string;
  featureKey: FeatureKey;
  usageCount: number;
  lastUsed: Date;
  resetDate: Date;
  metadata?: any;
}

export class FeatureLimitService {
  // =============================================
  // FEATURE CHECKING METHODS
  // =============================================

  /**
   * Check if user can use a feature
   */
  static async canUseFeature(
    userId: string,
    featureKey: FeatureKey,
    requestedAmount: number = 1
  ): Promise<FeatureCheckResult> {
    try {
      // Check if user is admin - give them unlimited access
      const userData = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userData[0]?.role === "ADMIN") {
        return { allowed: true, unlimited: true };
      }

      // Check for active overrides first
      const override = await this.getActiveOverride(userId, featureKey);
      if (override) {
        if (override.overrideValue === -1) {
          return { allowed: true, unlimited: true };
        }
        if (override.overrideValue === 0) {
          return {
            allowed: false,
            message: `Feature temporarily disabled: ${override.reason}`,
          };
        }
        // Use override value as limit
        const current = await this.getCurrentUsage(userId, featureKey);
        return {
          allowed: current + requestedAmount <= override.overrideValue,
          limit: override.overrideValue,
          current,
          message:
            current + requestedAmount > override.overrideValue
              ? `Override limit reached (${current}/${override.overrideValue} used)`
              : undefined,
        };
      }

      // Get user's plan
      const userPlan = await this.getUserPlan(userId);
      if (!userPlan) {
        // No plan = free plan
        return this.checkFeatureLimit(
          "free",
          featureKey,
          userId,
          requestedAmount
        );
      }

      return this.checkFeatureLimit(
        userPlan.planType,
        featureKey,
        userId,
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

  /**
   * Check if user has access to a feature (boolean features)
   */
  static async hasFeatureAccess(
    userId: string,
    featureKey: FeatureKey
  ): Promise<boolean> {
    const result = await this.canUseFeature(userId, featureKey, 0);
    return result.allowed;
  }

  /**
   * Get current usage for a user and feature
   */
  static async getCurrentUsage(
    userId: string,
    featureKey: FeatureKey
  ): Promise<number> {
    try {
      // For count-based features that depend on existing data
      if (featureKey === "stores_count") {
        const storeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(store)
          .where(eq(store.merchantId, userId));
        return storeCount[0]?.count || 0;
      }

      if (featureKey === "products_count") {
        const productCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(product)
          .innerJoin(store, eq(product.storeId, store.id))
          .where(eq(store.merchantId, userId));
        return productCount[0]?.count || 0;
      }

      // For usage-tracked features (like email_service)
      const usage = await db
        .select()
        .from(featureUsage)
        .where(
          and(
            eq(featureUsage.userId, userId),
            eq(featureUsage.featureKey, featureKey)
          )
        )
        .limit(1);

      if (!usage.length) return 0;

      const record = usage[0];

      // Check if usage should be reset
      if (record.resetDate && new Date() > record.resetDate) {
        await this.resetUsage(userId, featureKey);
        return 0;
      }

      return record.usageCount;
    } catch (error) {
      console.error("Error getting current usage:", error);
      return 0;
    }
  }

  // =============================================
  // USAGE TRACKING METHODS
  // =============================================

  /**
   * Track feature usage
   */
  static async trackUsage(
    userId: string,
    featureKey: FeatureKey,
    amount: number = 1,
    metadata?: any
  ): Promise<void> {
    try {
      const today = new Date();
      const userPlan = await this.getUserPlan(userId);
      const planType = userPlan?.planType || "free";

      // Get feature limit to determine reset period
      const featureLimit = await db
        .select()
        .from(featureLimits)
        .where(
          and(
            eq(featureLimits.planType, planType),
            eq(featureLimits.featureKey, featureKey),
            eq(featureLimits.enabled, true)
          )
        )
        .limit(1);

      const resetPeriod = featureLimit[0]?.resetPeriod || "never";
      const resetDate = this.getNextResetDate(resetPeriod);

      // Check if usage record exists
      const existing = await db
        .select()
        .from(featureUsage)
        .where(
          and(
            eq(featureUsage.userId, userId),
            eq(featureUsage.featureKey, featureKey)
          )
        )
        .limit(1);

      if (existing.length) {
        // Update existing record
        await db
          .update(featureUsage)
          .set({
            usageCount: sql`${featureUsage.usageCount} + ${amount}`,
            lastUsed: today,
            metadata,
            updatedAt: today,
          })
          .where(
            and(
              eq(featureUsage.userId, userId),
              eq(featureUsage.featureKey, featureKey)
            )
          );
      } else {
        // Insert new record
        await db.insert(featureUsage).values({
          id: crypto.randomUUID(),
          userId,
          featureKey,
          usageCount: amount,
          lastUsed: today,
          resetDate,
          metadata,
        });
      }
    } catch (error) {
      console.error("Error tracking usage:", error);
      throw error;
    }
  }

  // =============================================
  // ADMIN MANAGEMENT METHODS
  // =============================================

  /**
   * Get all feature limits
   */
  static async getAllFeatureLimits(): Promise<FeatureLimit[]> {
    return db
      .select()
      .from(featureLimits)
      .orderBy(featureLimits.planType, featureLimits.featureKey);
  }

  /**
   * Create or update a feature limit
   */
  static async upsertFeatureLimit(
    planType: PlanType,
    featureKey: FeatureKey,
    limitType: LimitType,
    limitValue: number,
    resetPeriod: ResetPeriod = "never",
    enabled: boolean = true,
    description?: string
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(featureLimits)
        .where(
          and(
            eq(featureLimits.planType, planType),
            eq(featureLimits.featureKey, featureKey)
          )
        )
        .limit(1);

      const now = new Date();

      if (existing.length) {
        // Update existing
        await db
          .update(featureLimits)
          .set({
            limitType,
            limitValue,
            resetPeriod,
            enabled,
            description,
            updatedAt: now,
          })
          .where(
            and(
              eq(featureLimits.planType, planType),
              eq(featureLimits.featureKey, featureKey)
            )
          );
      } else {
        // Create new
        await db.insert(featureLimits).values({
          id: crypto.randomUUID(),
          planType,
          featureKey,
          limitType,
          limitValue,
          resetPeriod,
          enabled,
          description,
        });
      }
    } catch (error) {
      console.error("Error upserting feature limit:", error);
      throw error;
    }
  }

  /**
   * Delete a feature limit
   */
  static async deleteFeatureLimit(
    planType: PlanType,
    featureKey: FeatureKey
  ): Promise<void> {
    await db
      .delete(featureLimits)
      .where(
        and(
          eq(featureLimits.planType, planType),
          eq(featureLimits.featureKey, featureKey)
        )
      );
  }

  /**
   * Create feature override for a user
   */
  static async createFeatureOverride(
    userId: string,
    featureKey: FeatureKey,
    overrideValue: number,
    reason: string,
    expiresAt: Date | null,
    createdBy: string
  ): Promise<void> {
    try {
      // Remove existing override first
      await db
        .delete(featureOverrides)
        .where(
          and(
            eq(featureOverrides.userId, userId),
            eq(featureOverrides.featureKey, featureKey)
          )
        );

      // Create new override
      await db.insert(featureOverrides).values({
        id: crypto.randomUUID(),
        userId,
        featureKey,
        overrideValue,
        reason,
        expiresAt,
        createdBy,
      });
    } catch (error) {
      console.error("Error creating feature override:", error);
      throw error;
    }
  }

  /**
   * Remove feature override
   */
  static async removeFeatureOverride(
    userId: string,
    featureKey: FeatureKey
  ): Promise<void> {
    await db
      .delete(featureOverrides)
      .where(
        and(
          eq(featureOverrides.userId, userId),
          eq(featureOverrides.featureKey, featureKey)
        )
      );
  }

  // =============================================
  // PLAN MANAGEMENT METHODS
  // =============================================

  /**
   * Assign plan to user
   */
  static async assignUserPlan(
    userId: string,
    planType: PlanType,
    endDate?: Date,
    stripeSubscriptionId?: string,
    stripePriceId?: string
  ): Promise<void> {
    try {
      // Cancel existing active plans
      await db
        .update(userPlans)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(
          and(eq(userPlans.userId, userId), eq(userPlans.status, "active"))
        );

      // Create new plan
      await db.insert(userPlans).values({
        id: crypto.randomUUID(),
        userId,
        planType,
        status: "active",
        endDate,
        stripeSubscriptionId,
        stripePriceId,
      });
    } catch (error) {
      console.error("Error assigning user plan:", error);
      throw error;
    }
  }

  /**
   * Get user's current plan
   */
  static async getUserPlan(userId: string) {
    const plan = await db
      .select()
      .from(userPlans)
      .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
      .orderBy(desc(userPlans.createdAt))
      .limit(1);

    return plan[0] || null;
  }

  // =============================================
  // INITIALIZATION METHODS
  // =============================================

  /**
   * Seed default feature limits
   */
  static async seedDefaultLimits(): Promise<void> {
    const defaultLimits: Array<{
      planType: PlanType;
      featureKey: FeatureKey;
      limitType: LimitType;
      limitValue: number;
      resetPeriod?: ResetPeriod;
      description?: string;
    }> = [
      // Free plan limits
      {
        planType: "free",
        featureKey: "stores_count",
        limitType: "count",
        limitValue: 1,
        description: "Maximum number of stores",
      },
      {
        planType: "free",
        featureKey: "products_count",
        limitType: "count",
        limitValue: 10,
        description: "Maximum number of products across all stores",
      },
      {
        planType: "free",
        featureKey: "custom_domain",
        limitType: "boolean",
        limitValue: 0,
        description: "Custom domain access",
      },
      {
        planType: "free",
        featureKey: "email_service",
        limitType: "monthly",
        limitValue: 0,
        resetPeriod: "monthly",
        description: "Monthly email sending limit",
      },
      {
        planType: "free",
        featureKey: "zynkart_branding",
        limitType: "boolean",
        limitValue: 1,
        description: "Zynkart branding display (1 = shown, 0 = hidden)",
      },
      {
        planType: "free",
        featureKey: "api_mode",
        limitType: "boolean",
        limitValue: 0,
        description: "API/CMS mode access",
      },
      {
        planType: "free",
        featureKey: "templates_access",
        limitType: "count",
        limitValue: 1,
        description: "Number of template themes available",
      },

      // Pro plan limits
      {
        planType: "pro",
        featureKey: "stores_count",
        limitType: "count",
        limitValue: 2,
        description: "Maximum number of stores",
      },
      {
        planType: "pro",
        featureKey: "products_count",
        limitType: "count",
        limitValue: 50,
        description: "Maximum number of products across all stores",
      },
      {
        planType: "pro",
        featureKey: "custom_domain",
        limitType: "boolean",
        limitValue: 1,
        description: "Custom domain access",
      },
      {
        planType: "pro",
        featureKey: "email_service",
        limitType: "monthly",
        limitValue: 500,
        resetPeriod: "monthly",
        description: "Monthly email sending limit",
      },
      {
        planType: "pro",
        featureKey: "zynkart_branding",
        limitType: "boolean",
        limitValue: 0,
        description: "Zynkart branding display (1 = shown, 0 = hidden)",
      },
      {
        planType: "pro",
        featureKey: "api_mode",
        limitType: "boolean",
        limitValue: 0,
        description: "API/CMS mode access",
      },
      {
        planType: "pro",
        featureKey: "templates_access",
        limitType: "count",
        limitValue: 3,
        description: "Number of template themes available",
      },

      // Elite plan limits
      {
        planType: "elite",
        featureKey: "stores_count",
        limitType: "count",
        limitValue: -1,
        description: "Unlimited stores",
      },
      {
        planType: "elite",
        featureKey: "products_count",
        limitType: "count",
        limitValue: -1,
        description: "Unlimited products",
      },
      {
        planType: "elite",
        featureKey: "custom_domain",
        limitType: "boolean",
        limitValue: 1,
        description: "Custom domain access",
      },
      {
        planType: "elite",
        featureKey: "email_service",
        limitType: "monthly",
        limitValue: -1,
        resetPeriod: "monthly",
        description: "Unlimited monthly emails",
      },
      {
        planType: "elite",
        featureKey: "zynkart_branding",
        limitType: "boolean",
        limitValue: 0,
        description: "Zynkart branding display (1 = shown, 0 = hidden)",
      },
      {
        planType: "elite",
        featureKey: "api_mode",
        limitType: "boolean",
        limitValue: 1,
        description: "API/CMS mode access",
      },
      {
        planType: "elite",
        featureKey: "templates_access",
        limitType: "count",
        limitValue: -1,
        description: "Access to all template themes",
      },
    ];

    for (const limit of defaultLimits) {
      try {
        await this.upsertFeatureLimit(
          limit.planType,
          limit.featureKey,
          limit.limitType,
          limit.limitValue,
          limit.resetPeriod,
          true,
          limit.description
        );
        console.log(`✅ Added ${limit.planType} - ${limit.featureKey} limit`);
      } catch (error) {
        console.error(
          `❌ Error inserting ${limit.planType} - ${limit.featureKey}:`,
          error
        );
      }
    }
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private static async checkFeatureLimit(
    planType: PlanType,
    featureKey: FeatureKey,
    userId: string,
    requestedAmount: number
  ): Promise<FeatureCheckResult> {
    // Get feature limit for this plan
    const featureLimit = await db
      .select()
      .from(featureLimits)
      .where(
        and(
          eq(featureLimits.planType, planType),
          eq(featureLimits.featureKey, featureKey),
          eq(featureLimits.enabled, true)
        )
      )
      .limit(1);

    if (!featureLimit.length) {
      return { allowed: false, message: "Feature not available for your plan" };
    }

    const limit = featureLimit[0];

    // Feature is disabled
    if (limit.limitValue === 0) {
      return {
        allowed: false,
        message: "Feature not available for your plan",
        upgradeRequired: true,
        suggestedPlan: this.getSuggestedUpgrade(planType),
      };
    }

    // Unlimited feature
    if (limit.limitValue === -1) {
      return { allowed: true, unlimited: true };
    }

    // Check current usage
    const currentUsage = await this.getCurrentUsage(userId, featureKey);
    const wouldExceed = currentUsage + requestedAmount > limit.limitValue;

    return {
      allowed: !wouldExceed,
      limit: limit.limitValue,
      current: currentUsage,
      upgradeRequired: wouldExceed,
      suggestedPlan: wouldExceed
        ? this.getSuggestedUpgrade(planType)
        : undefined,
      message: wouldExceed
        ? `${featureKey.replace("_", " ")} limit reached (${currentUsage}/${
            limit.limitValue
          } used). ${
            limit.resetPeriod === "monthly"
              ? "Resets monthly."
              : limit.resetPeriod === "daily"
              ? "Resets daily."
              : "Upgrade your plan for more access."
          }`
        : undefined,
    };
  }

  private static async getActiveOverride(
    userId: string,
    featureKey: FeatureKey
  ) {
    const override = await db
      .select()
      .from(featureOverrides)
      .where(
        and(
          eq(featureOverrides.userId, userId),
          eq(featureOverrides.featureKey, featureKey),
          // Check if not expired
          sql`(${featureOverrides.expiresAt} IS NULL OR ${featureOverrides.expiresAt} > NOW())`
        )
      )
      .limit(1);

    return override[0] || null;
  }

  private static async resetUsage(
    userId: string,
    featureKey: FeatureKey
  ): Promise<void> {
    const userPlan = await this.getUserPlan(userId);
    const planType = userPlan?.planType || "free";

    const featureLimit = await db
      .select()
      .from(featureLimits)
      .where(
        and(
          eq(featureLimits.planType, planType),
          eq(featureLimits.featureKey, featureKey),
          eq(featureLimits.enabled, true)
        )
      )
      .limit(1);

    const resetPeriod = featureLimit[0]?.resetPeriod || "never";

    await db
      .update(featureUsage)
      .set({
        usageCount: 0,
        resetDate: this.getNextResetDate(resetPeriod),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(featureUsage.userId, userId),
          eq(featureUsage.featureKey, featureKey)
        )
      );
  }

  private static getNextResetDate(resetPeriod: ResetPeriod): Date {
    const now = new Date();

    switch (resetPeriod) {
      case "monthly":
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;
      case "daily":
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      case "never":
      default:
        return new Date(8640000000000000); // Max Date
    }
  }

  private static getSuggestedUpgrade(
    currentPlan: PlanType
  ): PlanType | undefined {
    switch (currentPlan) {
      case "free":
        return "pro";
      case "pro":
        return "elite";
      default:
        return undefined;
    }
  }
}
