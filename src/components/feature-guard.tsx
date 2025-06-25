"use client";

import { ReactNode } from "react";
import { useFeatureLimit, useFeatureAccess } from "@/hooks/use-feature-limits";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import type { FeatureKey } from "@/services/feature-limit";

interface FeatureGuardProps {
  userId: string;
  featureKey: FeatureKey;
  requestedAmount?: number;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeAction?: () => void;
}

export function FeatureGuard({
  userId,
  featureKey,
  requestedAmount = 1,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeAction,
}: FeatureGuardProps) {
  const {
    allowed,
    loading,
    limit,
    current,
    message,
    upgradeRequired,
    suggestedPlan,
  } = useFeatureLimit({
    userId,
    featureKey,
    requestedAmount,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">
          Checking feature access...
        </div>
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt && upgradeRequired) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">
              {featureKey
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
              Limit Reached
            </CardTitle>
            {suggestedPlan && (
              <Badge
                variant="outline"
                className="text-amber-700 border-amber-300"
              >
                Upgrade to {suggestedPlan.toUpperCase()}
              </Badge>
            )}
          </div>
          <CardDescription>
            {message || `You've reached the limit for this feature.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {limit && current !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Current usage</span>
                <span>
                  {current}/{limit === -1 ? "∞" : limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{
                    width:
                      limit === -1
                        ? "0%"
                        : `${Math.min((current / limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
          {upgradeAction && (
            <Button onClick={upgradeAction} className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Simple blocked message
  return (
    <Alert className="border-red-200 bg-red-50">
      <Lock className="h-4 w-4" />
      <AlertTitle>Feature Not Available</AlertTitle>
      <AlertDescription>
        {message || `This feature is not available on your current plan.`}
      </AlertDescription>
    </Alert>
  );
}

interface BooleanFeatureGuardProps {
  userId: string;
  featureKey: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeAction?: () => void;
}

export function BooleanFeatureGuard({
  userId,
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeAction,
}: BooleanFeatureGuardProps) {
  const { hasAccess, loading } = useFeatureAccess({ userId, featureKey });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">
          Checking feature access...
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <CardTitle>
              {featureKey
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
              Not Available
            </CardTitle>
          </div>
          <CardDescription>
            This feature is not available on your current plan.
          </CardDescription>
        </CardHeader>
        {upgradeAction && (
          <CardContent>
            <Button onClick={upgradeAction} className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return null;
}

interface UsageMeterProps {
  userId: string;
  featureKey: FeatureKey;
  className?: string;
}

export function UsageMeter({ userId, featureKey, className }: UsageMeterProps) {
  const {  loading, limit, current, unlimited } = useFeatureLimit({
    userId,
    featureKey,
    requestedAmount: 0,
  });

  if (loading || unlimited || !limit || current === undefined) {
    return null;
  }

  const percentage = (current / limit) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {featureKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
        <span
          className={`${
            isAtLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-amber-600"
              : "text-muted-foreground"
          }`}
        >
          {current}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isAtLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isNearLimit && (
        <div className="text-xs text-amber-600">
          {isAtLimit ? "Limit reached" : "Approaching limit"}
        </div>
      )}
    </div>
  );
}
