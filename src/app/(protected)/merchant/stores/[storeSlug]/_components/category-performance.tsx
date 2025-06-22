"use client";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { MoreHorizontal } from "lucide-react";
import { getCategoryPerformanceData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface CategoryPerformanceProps {
  storeId: string;
  days: number;
}

const CategoryPerformance = ({ storeId, days }: CategoryPerformanceProps) => {
  const {
    data: categoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categoryPerformance", storeId, days],
    queryFn: () => getCategoryPerformanceData(storeId, days),
  });

  if (error) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Category Performance
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">Error loading category data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Category Performance
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

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Category Performance
          </h3>
          <button className="text-muted-foreground hover:text-muted-foreground/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">
            No category data available for this period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Category Performance
        </h3>
        <button className="text-muted-foreground hover:text-muted-foreground/80">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            labelFormatter={(label) => `Category: ${label}`}
            payload={categoryData.map((entry) => ({
              ...entry,
              payload: entry,
            }))}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background p-3 border rounded-lg shadow-sm">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Sales: ${data.sales?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Orders: {data.orders}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Products: {data.products}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {data.value}% of total sales
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPerformance;
