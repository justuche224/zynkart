"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomerOrders } from "@/actions/store/public/orders";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Package, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { PDFReceipt } from "@/components/pdf-receipt";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { useCustomerSession } from "@/hooks/use-customer-session";

export const CustomerOrders = ({ store }: { store: StoreDataFromHomePage }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<string>("");
  const [sort, setSort] = useState("createdAt");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const { customer } = useCustomerSession();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "customer-orders",
      store.id,
      page,
      search,
      paymentStatus,
      fulfillmentStatus,
      sort,
      orderBy,
    ],
    queryFn: () =>
      getCustomerOrders({
        storeId: store.id,
        page,
        limit: 10,
        search: search || undefined,
        paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
        fulfillmentStatus:
          fulfillmentStatus === "all" ? undefined : fulfillmentStatus,
        sort,
        orderBy,
      }),
    enabled: !!store.id,
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getFulfillmentStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (error) {
    return (
      <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load orders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {data.summary.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {formatCurrency(data.summary.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {data.summary.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {data.summary.completedOrders}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={fulfillmentStatus}
              onValueChange={setFulfillmentStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Order Status</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sort}-${orderBy}`}
              onValueChange={(value) => {
                const [newSort, newOrderBy] = value.split("-");
                setSort(newSort);
                setOrderBy(newOrderBy as "asc" | "desc");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="total-desc">Highest Amount</SelectItem>
                <SelectItem value="total-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            {data?.pagination
              ? `Showing ${
                  (data.pagination.page - 1) * data.pagination.limit + 1
                }-${Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                )} of ${data.pagination.total} orders`
              : "Loading orders..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">
                You haven&apos;t placed any orders yet.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/store/${store.slug}`}>Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            Order #{order.paymentReference}
                          </span>
                          <Badge
                            className={getPaymentStatusColor(
                              order.paymentStatus
                            )}
                          >
                            {order.paymentStatus}
                          </Badge>
                          <Badge
                            className={getFulfillmentStatusColor(
                              order.fulfillmentStatus
                            )}
                          >
                            {order.fulfillmentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            Ordered on{" "}
                            {format(new Date(order.createdAt), "PPP")}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Tracking:{" "}
                            </span>
                            <span className="font-mono">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Items:</h4>
                      <div className="grid gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            {item.product.image && (
                              <Image
                                width={40}
                                height={40}
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">
                                {item.productName}
                              </div>
                              {item.variantDetails && (
                                <div className="text-muted-foreground text-xs">
                                  {item.variantDetails}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div>Qty: {item.quantity}</div>
                              <div className="font-medium">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more item
                            {order.items.length - 3 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Subtotal: {formatCurrency(order.subtotal)} + Shipping:{" "}
                        {formatCurrency(order.shippingCost)}
                      </div>
                      <div className="flex gap-2">
                        <PDFReceipt
                          order={{
                            ...order,
                            customer: {
                              id: customer?.id || "",
                              name: customer?.name || "",
                              email: customer?.email || "",
                              phone: customer?.phone || "",
                            },
                          }}
                          store={{
                            id: store.id,
                            name: store.name,
                            slug: store.slug,
                            description: store.description || "",
                            logo: store.logoUrl || "",
                          }}
                          watermark={store.name}
                          size="sm"
                          variant="button"
                        />
                        {/* <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/store/${store.slug}/account/orders/${order.id}`}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.hasPrev}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, data.pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(data.pagination.totalPages - 4, page - 2)
                      ) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
