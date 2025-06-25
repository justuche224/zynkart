"use client";

import { useState, useEffect, useCallback } from "react";
import {
  checkFeatureLimit,
  checkFeatureAccess,
  getCurrentFeatureUsage,
} from "@/actions/admin/feature-limits";
import type { FeatureKey, FeatureCheckResult } from "@/services/feature-limit";

interface UseFeatureLimitOptions {
  userId: string;
  featureKey: FeatureKey;
  requestedAmount?: number;
  // Enable automatic checking
  enabled?: boolean;
}

interface UseFeatureLimitResult extends FeatureCheckResult {
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useFeatureLimit({
  userId,
  featureKey,
  requestedAmount = 1,
  enabled = true,
}: UseFeatureLimitOptions): UseFeatureLimitResult {
  const [result, setResult] = useState<FeatureCheckResult>({
    allowed: false,
    loading: true,
  } as any);
  const [loading, setLoading] = useState(true);

  const checkLimit = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await checkFeatureLimit(
        userId,
        featureKey,
        requestedAmount
      );
      setResult(response);
    } catch (error) {
      console.error("Error checking feature limit:", error);
      setResult({
        allowed: false,
        message: "Error checking feature limit",
      });
    } finally {
      setLoading(false);
    }
  }, [enabled, userId, featureKey, requestedAmount]);

  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  return {
    ...result,
    loading,
    refresh: checkLimit,
  };
}

interface UseFeatureAccessOptions {
  userId: string;
  featureKey: FeatureKey;
  enabled?: boolean;
}

interface UseFeatureAccessResult {
  hasAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useFeatureAccess({
  userId,
  featureKey,
  enabled = true,
}: UseFeatureAccessOptions): UseFeatureAccessResult {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await checkFeatureAccess(userId, featureKey);
      setHasAccess(response);
    } catch (error) {
      console.error("Error checking feature access:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, userId, featureKey]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    hasAccess,
    loading,
    refresh: checkAccess,
  };
}

interface UseCurrentUsageOptions {
  userId: string;
  featureKey: FeatureKey;
  enabled?: boolean;
}

interface UseCurrentUsageResult {
  usage: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useCurrentUsage({
  userId,
  featureKey,
  enabled = true,
}: UseCurrentUsageOptions): UseCurrentUsageResult {
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const checkUsage = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getCurrentFeatureUsage(userId, featureKey);
      setUsage(response);
    } catch (error) {
      console.error("Error checking current usage:", error);
      setUsage(0);
    } finally {
      setLoading(false);
    }
  }, [enabled, userId, featureKey]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  return {
    usage,
    loading,
    refresh: checkUsage,
  };
}
