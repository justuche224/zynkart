"use client";
import { Package, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  avgOrderValue,
  conversionRate,
  totalProducts,
  productsInStock,
} from "@/actions/dashboard/metrics";
import { Skeleton } from "@/components/ui/skeleton";
import formatPrice from "@/lib/price-formatter";

const MetricWrapper = ({
  title,
  icon: Icon,
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
      <div className="bg-background p-4 rounded-lg shadow-sm border">
        <p className="text-red-500 text-sm">
          Error loading {title.toLowerCase()}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="txet-md md:text-lg font-bold text-foreground">
            {format === "currency"
              ? formatPrice(data?.value || 0)
              : format === "percentage"
              ? `${data?.value?.toFixed(1) || 0}%`
              : data?.value?.toLocaleString() || 0}
          </p>
        </div>
        <Icon
          className={`h-5 w-5 ${
            title === "Avg Order Value"
              ? "text-green-500"
              : title === "Conversion Rate"
              ? "text-yellow-500"
              : title === "Total Products"
              ? "text-blue-500"
              : "text-purple-500"
          }`}
        />
      </div>
      {data && (
        <div className="flex items-center mt-2">
          <span
            className={`text-sm font-medium ${
              (data.change || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {(data.change || 0) >= 0 ? "+" : ""}
            {data.change?.toFixed(1) || 0}%
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            {period ? `${period} days ago` : "last period"}
          </span>
        </div>
      )}
    </div>
  );
};

const AdditionalMetrics = ({
  storeId,
  days,
}: {
  storeId: string;
  days: number;
}) => {
  const {
    data: aovData,
    isLoading: aovLoading,
    error: aovError,
  } = useQuery({
    queryKey: ["avgOrderValue", storeId, days],
    queryFn: () => avgOrderValue(storeId, days),
  });

  const {
    data: conversionData,
    isLoading: conversionLoading,
    error: conversionError,
  } = useQuery({
    queryKey: ["conversionRate", storeId, days],
    queryFn: () => conversionRate(storeId, days),
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["totalProducts", storeId, days],
    queryFn: () => totalProducts(storeId, days),
  });

  const {
    data: stockData,
    isLoading: stockLoading,
    error: stockError,
  } = useQuery({
    queryKey: ["productsInStock", storeId, days],
    queryFn: () => productsInStock(storeId, days),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <MetricWrapper
        title="Avg Order Value"
        icon={TrendingUp}
        isLoading={aovLoading}
        hasError={!!aovError}
        data={aovData}
        format="currency"
        period={days}
      />
      <MetricWrapper
        title="Conversion Rate"
        icon={Star}
        isLoading={conversionLoading}
        hasError={!!conversionError}
        data={conversionData}
        format="percentage"
        period={days}
      />
      <MetricWrapper
        title="Total Products"
        icon={Package}
        isLoading={productsLoading}
        hasError={!!productsError}
        data={productsData}
        period={days}
      />
      <MetricWrapper
        title="In Stock"
        icon={ShoppingCart}
        isLoading={stockLoading}
        hasError={!!stockError}
        data={stockData}
        period={days}
      />
    </div>
  );
};

export default AdditionalMetrics;
