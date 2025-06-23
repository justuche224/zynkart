"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { getSalesChartData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesChartProps {
  storeId: string;
  days: number;
}

const SalesChart = ({ storeId, days }: SalesChartProps) => {
  const {
    data: chartData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["salesChartData", storeId, days],
    queryFn: () => getSalesChartData(storeId, days),
  });

  if (error) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Sales Overview
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">Error loading sales chart data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Sales Overview
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-2 md:p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Sales Overview
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Sales</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Visitors</span>
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-muted-foreground/80">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
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
            formatter={(value, name) => [
              name === "sales"
                ? `$${Number(value).toLocaleString()}`
                : Number(value).toLocaleString(),
              name === "sales"
                ? "Sales"
                : name === "orders"
                ? "Orders"
                : "Visitors",
            ]}
            labelFormatter={(date) =>
              new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="sales"
            stackId="1"
            stroke="#3B82F6"
            fill="#93C5FD"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stackId="2"
            stroke="#10B981"
            fill="#86EFAC"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stackId="3"
            stroke="#F59E0B"
            fill="#FCD34D"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
