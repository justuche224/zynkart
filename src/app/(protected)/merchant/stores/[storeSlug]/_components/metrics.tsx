"use client";
import { MetricCard } from "./metcric-card";
import { DollarSign, ShoppingBag, Users, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalVisits,
} from "@/actions/dashboard/metrics";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsProps {
  storeId: string;
  days?: number;
}

const MetricWrapper = ({
  title,
  icon,
  isLoading,
  hasError,
  data,
  format,
  period,
}: {
  title: string;
  icon: any;
  isLoading: boolean;
  hasError: boolean;
  data?: { value: number; change: number };
  format?: string;
  period?: number;
}) => {
  if (hasError) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <p className="text-red-500 text-sm">
          Error loading {title.toLowerCase()}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background p-6 rounded-lg shadow-sm border">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <MetricCard
      title={title}
      value={data?.value || 0}
      change={data?.change || 0}
      icon={icon}
      format={format}
      period={period ? `${period} days ago` : "last period"}
    />
  );
};

const Metrics = ({ storeId, days = 7 }: MetricsProps) => {
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useQuery({
    queryKey: ["totalRevenue", storeId, days],
    queryFn: () => totalRevenue(storeId, days),
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["totalOrders", storeId, days],
    queryFn: () => totalOrders(storeId, days),
  });

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useQuery({
    queryKey: ["totalCustomers", storeId, days],
    queryFn: () => totalCustomers(storeId, days),
  });

  const {
    data: visitsData,
    isLoading: visitsLoading,
    error: visitsError,
  } = useQuery({
    queryKey: ["totalVisits", storeId, days],
    queryFn: () => totalVisits(storeId, days),
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricWrapper
        title="Total Revenue"
        icon={DollarSign}
        isLoading={revenueLoading}
        hasError={!!revenueError}
        data={revenueData}
        format="currency"
        period={days}
      />
      <MetricWrapper
        title="Total Orders"
        icon={ShoppingBag}
        isLoading={ordersLoading}
        hasError={!!ordersError}
        data={ordersData}
        period={days}
      />
      <MetricWrapper
        title="Total Customers"
        icon={Users}
        isLoading={customersLoading}
        hasError={!!customersError}
        data={customersData}
        period={days}
      />
      <MetricWrapper
        title="Store Visits"
        icon={Eye}
        isLoading={visitsLoading}
        hasError={!!visitsError}
        data={visitsData}
        period={days}
      />
    </div>
  );
};

export default Metrics;
