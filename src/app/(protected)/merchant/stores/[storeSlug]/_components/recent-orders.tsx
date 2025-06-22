"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentOrdersData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";
import formatPrice from "@/lib/price-formatter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const StatusBadge = ({
  status,
  type = "fulfillment",
}: {
  status: string;
  type?: string;
}) => {
  const getStatusColor = () => {
    if (type === "payment") {
      switch (status) {
        case "PAID":
          return "bg-green-100 text-green-800";
        case "PENDING":
          return "bg-yellow-100 text-yellow-800";
        case "FAILED":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else {
      switch (status) {
        case "DELIVERED":
          return "bg-green-100 text-green-800";
        case "SHIPPED":
          return "bg-blue-100 text-blue-800";
        case "PROCESSING":
          return "bg-yellow-100 text-yellow-800";
        case "CANCELLED":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

interface RecentOrdersProps {
  storeId: string;
  days: number;
  storeSlug: string;
}

const RecentOrders = ({ storeId, storeSlug }: RecentOrdersProps) => {
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recentOrders", storeId],
    queryFn: () => getRecentOrdersData(storeId, 5),
  });

  if (error) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/orders`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-red-500 text-center">
            Error loading recent orders
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/orders`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!ordersData || ordersData.length === 0) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/orders`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-center">
            No recent orders found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Orders
          </h3>
          <Button variant="link" asChild>
            <Link href={`/merchant/stores/${storeSlug}/orders`}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-gray-200">
            {ordersData.map((order) => (
              <tr key={order.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      #{order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {order.customer}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
