"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentOrdersData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";
import formatPrice from "@/lib/price-formatter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="p-2 md:p-6 border-b border-gray-200">
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
        <div className="p-2 md:p-6 border-b border-gray-200">
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
        <div className="p-2 md:p-6 border-b border-gray-200">
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
      <div className="p-2 md:p-6 border-b border-gray-200">
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

      {/* Mobile-friendly card layout for small screens */}
      <div className="block md:hidden">
        <div className="p-4 space-y-4">
          {ordersData.map((order) => (
            <div key={order.id} className="p-4 border rounded-lg bg-card">
              <div className="flex justify-between items-start mb-3">
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
                <div className="text-sm font-medium text-foreground">
                  {formatPrice(order.total)}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-foreground">
                  {order.customer}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.email}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table layout for larger screens */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {order.customer}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {formatPrice(order.total)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentOrders;
