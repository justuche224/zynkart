"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MoreHorizontal, Monitor, Smartphone, Tablet } from "lucide-react";
import { getVisitorAnalyticsData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitorsProps {
  storeId: string;
  days: number;
}

const Visitors = ({ storeId, days }: VisitorsProps) => {
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["visitorAnalytics", storeId, days],
    queryFn: () => getVisitorAnalyticsData(storeId, days),
  });

  const getOSIcon = (os: string) => {
    const osLower = os.toLowerCase();
    if (
      osLower.includes("windows") ||
      osLower.includes("mac") ||
      osLower.includes("linux")
    ) {
      return <Monitor className="w-4 h-4" />;
    }
    if (osLower.includes("android") || osLower.includes("ios")) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Tablet className="w-4 h-4" />;
  };

  const osColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (error) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Visitor Analytics
          </h3>
        </div>
        <p className="text-red-500 text-center">
          Error loading visitor analytics
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visitors Loading */}
        <div className="bg-background p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* OS Breakdown Loading */}
        <div className="bg-background p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="w-24 h-2 rounded-full mr-3" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Visitor Analytics
          </h3>
        </div>
        <p className="text-muted-foreground text-center">
          No visitor data available for this period
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Visitor Traffic */}
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Daily Visitor Traffic
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.dailyVisitors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              }
              formatter={(value) => [value, "Visitors"]}
            />
            <Bar dataKey="visitors" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Operating System Breakdown */}
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Operating Systems
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {analyticsData.osBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No OS data available for this period
          </p>
        ) : (
          <div className="space-y-4">
            {analyticsData.osBreakdown.slice(0, 5).map((osData, index) => (
              <div
                key={osData.os}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{
                      backgroundColor: `${osColors[index % osColors.length]}20`,
                    }}
                  >
                    <div style={{ color: osColors[index % osColors.length] }}>
                      {getOSIcon(osData.os)}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {osData.os}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-muted rounded-full h-2 mr-3">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${osData.percentage}%`,
                        backgroundColor: osColors[index % osColors.length],
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                    {osData.visits}
                  </span>
                </div>
              </div>
            ))}

            {analyticsData.totalVisits > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsData.totalVisits.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Visitors;
