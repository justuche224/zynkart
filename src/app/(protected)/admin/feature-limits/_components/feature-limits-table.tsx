"use client";

import { useState, useEffect } from "react";
import {
  getFeatureLimits,
  deleteFeatureLimit,
} from "@/actions/admin/feature-limits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditFeatureLimitDialog } from "./edit-feature-limit-dialog";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import type {
  FeatureLimit,
  PlanType,
  FeatureKey,
} from "@/services/feature-limit";

export function FeatureLimitsTable() {
  const [limits, setLimits] = useState<FeatureLimit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const result = await getFeatureLimits();
      if (result.success) {
        setLimits(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load feature limits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planType: PlanType, featureKey: FeatureKey) => {
    try {
      const result = await deleteFeatureLimit(planType, featureKey);
      if (result.success) {
        toast.success(result.message);
        loadLimits();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete feature limit");
    }
  };

  const formatLimitValue = (value: number, limitType: string) => {
    if (value === -1) return "Unlimited";
    if (value === 0 && limitType === "boolean") return "Disabled";
    if (value === 1 && limitType === "boolean") return "Enabled";
    return value.toString();
  };

  const getPlanBadgeVariant = (planType: PlanType) => {
    switch (planType) {
      case "free":
        return "secondary";
      case "pro":
        return "default";
      case "elite":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLimitTypeColor = (limitType: string) => {
    switch (limitType) {
      case "count":
        return "bg-blue-100 text-blue-800";
      case "monthly":
        return "bg-green-100 text-green-800";
      case "boolean":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading feature limits...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Type</TableHead>
            <TableHead>Feature</TableHead>
            <TableHead>Limit Type</TableHead>
            <TableHead>Limit Value</TableHead>
            <TableHead>Reset Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {limits.map((limit) => (
            <TableRow key={`${limit.planType}-${limit.featureKey}`}>
              <TableCell>
                <Badge variant={getPlanBadgeVariant(limit.planType)}>
                  {limit.planType.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {limit.featureKey
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getLimitTypeColor(
                    limit.limitType
                  )}`}
                >
                  {limit.limitType}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono">
                  {formatLimitValue(limit.limitValue, limit.limitType)}
                </span>
              </TableCell>
              <TableCell>
                {limit.resetPeriod === "never" ? "-" : limit.resetPeriod}
              </TableCell>
              <TableCell>
                <Badge variant={limit.enabled ? "default" : "secondary"}>
                  {limit.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell
                className="max-w-xs truncate"
                title={limit.description ?? undefined}
              >
                {limit.description ?? "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <EditFeatureLimitDialog limit={limit} onSuccess={loadLimits}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditFeatureLimitDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Feature Limit
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the feature limit for{" "}
                          <strong>{limit.featureKey}</strong> on the{" "}
                          <strong>{limit.planType}</strong> plan? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(limit.planType, limit.featureKey)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {limits.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground"
              >
                No feature limits configured. Click &quot;Seed Default Limits&quot;
                to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
