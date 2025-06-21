"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Search,
  MoreHorizontal,
  Edit,
  Loader2,
  Truck,
  Package,
  X,
  Archive,
  Download,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { getStoreOrders, getOrderById } from "@/actions/orders";
import { updateOrderStatus } from "@/actions/orders/update-status";
import {
  updateTrackingInfo,
  removeTrackingInfo,
} from "@/actions/orders/update-tracking";
import {
  bulkUpdateOrderStatus,
  bulkMarkAsShipped,
  bulkMarkAsDelivered,
  bulkMarkPaymentReceived,
} from "@/actions/orders/bulk-operations";
import { exportOrders, exportSingleOrder } from "@/actions/orders/export";
import formatPrice from "@/lib/price-formatter";
import { shippingInfoSchema } from "@/schemas";
import { z } from "zod";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface OrdersPageProps {
  storeId: string;
}

type ShippingInfo = z.infer<typeof shippingInfoSchema>;

export const OrdersPage = ({ storeId }: OrdersPageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParamsPage = searchParams.get("page") || 1;
  const searchParamsPaymentStatus = searchParams.get("paymentStatus") || "all";
  const searchParamsFulfillmentStatus =
    searchParams.get("fulfillmentStatus") || "all";
  const searchParamsSearch = searchParams.get("search") || "";
  const searchParamsSort = searchParams.get("sort") || "createdAt";
  const searchParamsOrderBy: "desc" | "asc" | undefined = searchParams.get(
    "orderBy"
  ) as "desc" | "asc" | undefined;
  const orderBy = searchParamsOrderBy === "desc" ? "desc" : "asc";
  const [page, setPage] = useState(Number(searchParamsPage));
  const [search, setSearch] = useState(searchParamsSearch);
  const [paymentStatus, setPaymentStatus] = useState(searchParamsPaymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(
    searchParamsFulfillmentStatus
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const [updateStatusOrderId, setUpdateStatusOrderId] = useState<string | null>(
    null
  );
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusUpdateType, setStatusUpdateType] = useState<
    "payment" | "fulfillment" | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [updateTrackingOrderId, setUpdateTrackingOrderId] = useState<
    string | null
  >(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [trackingAction, setTrackingAction] = useState<
    "add" | "update" | "remove" | null
  >(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<"selected" | "filtered" | "all">(
    "all"
  );
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (page !== 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    if (search && search.trim() !== "") {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    if (paymentStatus !== "all") {
      params.set("paymentStatus", paymentStatus);
    } else {
      params.delete("paymentStatus");
    }

    if (fulfillmentStatus !== "all") {
      params.set("fulfillmentStatus", fulfillmentStatus);
    } else {
      params.delete("fulfillmentStatus");
    }

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      const newUrl = newParamsString
        ? `${pathname}?${newParamsString}`
        : pathname;
      router.push(newUrl, { scroll: false });
    }
  }, [
    page,
    search,
    paymentStatus,
    fulfillmentStatus,
    searchParams,
    pathname,
    router,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        search !== searchParamsSearch ||
        paymentStatus !== searchParamsPaymentStatus ||
        fulfillmentStatus !== searchParamsFulfillmentStatus
      ) {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    search,
    paymentStatus,
    fulfillmentStatus,
    searchParamsSearch,
    searchParamsPaymentStatus,
    searchParamsFulfillmentStatus,
  ]);

  useEffect(() => {
    setSelectedOrders(new Set());
  }, [page, search, paymentStatus, fulfillmentStatus]);

  const limit = 50;

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: [
      "store-orders",
      storeId,
      page,
      search,
      paymentStatus,
      fulfillmentStatus,
    ],
    queryFn: () =>
      getStoreOrders({
        storeId,
        page,
        limit,
        search: search || undefined,
        paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
        fulfillmentStatus:
          fulfillmentStatus === "all" ? undefined : fulfillmentStatus,
        sort: searchParamsSort,
        orderBy: orderBy,
      }),
    enabled: !!storeId,
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ["order-details", selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!, storeId),
    enabled: !!selectedOrderId,
  });

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      paymentStatus,
      fulfillmentStatus,
    }: {
      orderId: string;
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
      fulfillmentStatus?: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }) => {
      return updateOrderStatus({
        orderId,
        storeId,
        paymentStatus,
        fulfillmentStatus,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({
          queryKey: ["order-details", selectedOrderId],
        });
      }
      setIsStatusDialogOpen(false);
      setUpdateStatusOrderId(null);
      setStatusUpdateType(null);
      setSelectedStatus("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async ({
      orderId,
      action,
      trackingNumber,
      shippingProvider,
    }: {
      orderId: string;
      action: "add" | "update" | "remove";
      trackingNumber?: string;
      shippingProvider?: string;
    }) => {
      if (action === "remove") {
        return removeTrackingInfo(orderId, storeId);
      } else {
        return updateTrackingInfo({
          orderId,
          storeId,
          trackingNumber,
          shippingProvider,
        });
      }
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "Tracking information updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({
          queryKey: ["order-details", selectedOrderId],
        });
      }
      setIsTrackingDialogOpen(false);
      setUpdateTrackingOrderId(null);
      setTrackingAction(null);
      setTrackingNumber("");
      setShippingProvider("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tracking information");
    },
  });

  const bulkOperationMutation = useMutation({
    mutationFn: async ({
      action,
      orderIds,
      paymentStatus,
      fulfillmentStatus,
    }: {
      action: "status" | "shipped" | "delivered" | "payment";
      orderIds: string[];
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
      fulfillmentStatus?: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }) => {
      switch (action) {
        case "shipped":
          return bulkMarkAsShipped(orderIds, storeId);
        case "delivered":
          return bulkMarkAsDelivered(orderIds, storeId);
        case "payment":
          return bulkMarkPaymentReceived(orderIds, storeId);
        case "status":
          return bulkUpdateOrderStatus({
            orderIds,
            storeId,
            paymentStatus,
            fulfillmentStatus,
          });
        default:
          throw new Error("Invalid bulk action");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bulk operation completed successfully");
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      setSelectedOrders(new Set());
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bulk operation failed");
    },
  });

  const exportMutation = useMutation({
    mutationFn: async ({
      type,
      format,
      orderIds,
    }: {
      type: "selected" | "filtered" | "all";
      format: "csv" | "json";
      orderIds?: string[];
    }) => {
      if (type === "selected" && orderIds && orderIds.length > 0) {
        return exportOrders({
          storeId,
          format,
          orderIds,
        });
      } else if (type === "filtered") {
        return exportOrders({
          storeId,
          format,
          paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
          fulfillmentStatus:
            fulfillmentStatus === "all" ? undefined : fulfillmentStatus,
        });
      } else {
        return exportOrders({
          storeId,
          format,
        });
      }
    },
    onSuccess: (data) => {
      if (data.format === "csv" && "content" in data) {
        const blob = new Blob([data.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Exported ${data.count} orders to CSV`);
      } else if ("data" in data) {  
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Exported ${data.count} orders to JSON`);
      }

      setIsExportDialogOpen(false);
      setExportType("all");
      setExportFormat("csv");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Export failed");
    },
  });

  const singleOrderExportMutation = useMutation({
    mutationFn: async ({
      orderId,
      format,
    }: {
      orderId: string;
      format: "csv" | "json";
    }) => {
      return exportSingleOrder(orderId, storeId, format);
    },
    onSuccess: (data, variables) => {
      if (data.format === "csv" && "content" in data) {
        const blob = new Blob([data.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `order-${variables.orderId}-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Order exported to CSV");
      } else if ("data" in data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `order-${variables.orderId}-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Order exported to JSON");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export order");
    },
  });

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && ordersData?.orders) {
      setSelectedOrders(new Set(ordersData.orders.map((order) => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleBulkAction = (action: "shipped" | "delivered" | "payment") => {
    if (selectedOrders.size === 0) {
      toast.error("Please select orders first");
      return;
    }

    bulkOperationMutation.mutate({
      action,
      orderIds: Array.from(selectedOrders),
    });
  };

  const canBulkShip = () => {
    if (!ordersData?.orders) return false;
    return Array.from(selectedOrders).some((orderId) => {
      const order = ordersData.orders.find((o) => o.id === orderId);
      return (
        order?.paymentStatus === "PAID" &&
        order?.fulfillmentStatus === "PROCESSING"
      );
    });
  };

  const canBulkDeliver = () => {
    if (!ordersData?.orders) return false;
    return Array.from(selectedOrders).some((orderId) => {
      const order = ordersData.orders.find((o) => o.id === orderId);
      return order?.fulfillmentStatus === "SHIPPED";
    });
  };

  const canBulkPayment = () => {
    if (!ordersData?.orders) return false;
    return Array.from(selectedOrders).some((orderId) => {
      const order = ordersData.orders.find((o) => o.id === orderId);
      return order?.paymentStatus === "PENDING";
    });
  };

  const handleExport = (type: "selected" | "filtered" | "all") => {
    if (type === "selected" && selectedOrders.size === 0) {
      toast.error("Please select orders to export");
      return;
    }
    setExportType(type);
    setIsExportDialogOpen(true);
  };

  const confirmExport = () => {
    exportMutation.mutate({
      type: exportType,
      format: exportFormat,
      orderIds:
        exportType === "selected" ? Array.from(selectedOrders) : undefined,
    });
  };

  const handleSingleOrderExport = (
    orderId: string,
    format: "csv" | "json" = "csv"
  ) => {
    singleOrderExportMutation.mutate({
      orderId,
      format,
    });
  };

  const confirmStatusUpdate = () => {
    if (!updateStatusOrderId || !statusUpdateType || !selectedStatus) return;

    const updateData: any = { orderId: updateStatusOrderId };

    if (statusUpdateType === "payment") {
      updateData.paymentStatus = selectedStatus;
    } else {
      updateData.fulfillmentStatus = selectedStatus;
    }

    updateStatusMutation.mutate(updateData);
  };

  const getValidStatusOptions = (
    currentStatus: string,
    type: "payment" | "fulfillment"
  ) => {
    if (type === "payment") {
      const transitions = {
        PENDING: ["PAID", "FAILED", "REFUNDED"],
        PAID: ["REFUNDED"],
        FAILED: ["PENDING"],
        REFUNDED: [],
      };
      return transitions[currentStatus as keyof typeof transitions] || [];
    } else {
      const transitions = {
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "CANCELLED"],
        DELIVERED: [],
        CANCELLED: [],
      };
      return transitions[currentStatus as keyof typeof transitions] || [];
    }
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDialogOpen(true);
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: "outline",
      PAID: "default",
      FAILED: "destructive",
      REFUNDED: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getFulfillmentStatusBadge = (status: string) => {
    const variants = {
      PROCESSING: "outline",
      SHIPPED: "secondary",
      DELIVERED: "default",
      CANCELLED: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const handleTrackingUpdate = (
    orderId: string,
    action: "add" | "update" | "remove",
    currentTracking?: string,
    currentProvider?: string
  ) => {
    setUpdateTrackingOrderId(orderId);
    setTrackingAction(action);
    setTrackingNumber(currentTracking || "");
    setShippingProvider(currentProvider || "");
    setIsTrackingDialogOpen(true);
  };

  const confirmTrackingUpdate = () => {
    if (!updateTrackingOrderId || !trackingAction) return;

    if (trackingAction !== "remove" && !trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    updateTrackingMutation.mutate({
      orderId: updateTrackingOrderId,
      action: trackingAction,
      trackingNumber: trackingNumber.trim() || undefined,
      shippingProvider: shippingProvider.trim() || undefined,
    });
  };

  const canUpdateTracking = (order: any) => {
    return (
      order.paymentStatus === "PAID" && order.fulfillmentStatus !== "CANCELLED"
    );
  };

  if (ordersError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">
            Error loading orders: {ordersError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {ordersLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-30 w-full" />
          ))}
        </div>
      ) : (
        ordersData?.summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ordersData.summary.totalOrders}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(ordersData.summary.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ordersData.summary.pendingOrders}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Delivered Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ordersData.summary.deliveredOrders}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full md:w-[250px]"
                />
              </div>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
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
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Fulfillment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fulfillment</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("all")}>
                    Export All Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("filtered")}>
                    Export Filtered Orders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedOrders.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedOrders.size} order
                  {selectedOrders.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders(new Set())}
                >
                  Clear Selection
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {canBulkPayment() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("payment")}
                    disabled={bulkOperationMutation.isPending}
                  >
                    {bulkOperationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mark as Paid
                  </Button>
                )}

                {canBulkShip() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("shipped")}
                    disabled={bulkOperationMutation.isPending}
                  >
                    {bulkOperationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as Shipped
                  </Button>
                )}

                {canBulkDeliver() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("delivered")}
                    disabled={bulkOperationMutation.isPending}
                  >
                    {bulkOperationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Package className="mr-2 h-4 w-4" />
                    Mark as Delivered
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      More Actions
                      <MoreHorizontal className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("selected")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            ordersData &&
                            ordersData?.orders?.length > 0 &&
                            selectedOrders.size === ordersData?.orders?.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Fulfillment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData?.orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOrder(order.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => handleOrderClick(order.id)}
                        >
                          <div>
                            <div className="font-medium">
                              #{order.paymentReference}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.items.length} item(s)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), "hh:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          {getFulfillmentStatusBadge(order.fulfillmentStatus)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderClick(order.id);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Payment Status Update */}
                              {getValidStatusOptions(
                                order.paymentStatus,
                                "payment"
                              ).length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Payment Status
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {getValidStatusOptions(
                                      order.paymentStatus,
                                      "payment"
                                    ).map((status) => (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setUpdateStatusOrderId(order.id);
                                          setStatusUpdateType("payment");
                                          setSelectedStatus(status);
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        {status}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}

                              {/* Fulfillment Status Update */}
                              {getValidStatusOptions(
                                order.fulfillmentStatus,
                                "fulfillment"
                              ).length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Fulfillment Status
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {getValidStatusOptions(
                                      order.fulfillmentStatus,
                                      "fulfillment"
                                    ).map((status) => (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setUpdateStatusOrderId(order.id);
                                          setStatusUpdateType("fulfillment");
                                          setSelectedStatus(status);
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        {status}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}

                              {/* Tracking Information */}
                              {canUpdateTracking(order) && (
                                <>
                                  <DropdownMenuSeparator />

                                  {order.trackingNumber ? (
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Truck className="mr-2 h-4 w-4" />
                                        Tracking Info
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTrackingUpdate(
                                              order.id,
                                              "update",
                                              order.trackingNumber || undefined,
                                              order.shippingProvider ||
                                                undefined
                                            );
                                          }}
                                        >
                                          <Edit className="mr-2 h-4 w-4" />
                                          Update Tracking
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTrackingUpdate(
                                              order.id,
                                              "remove"
                                            );
                                          }}
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Remove Tracking
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTrackingUpdate(order.id, "add");
                                      }}
                                    >
                                      <Package className="mr-2 h-4 w-4" />
                                      Add Tracking
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              <DropdownMenuSeparator />

                              {/* Export Options */}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Export Order
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSingleOrderExport(order.id, "csv");
                                    }}
                                  >
                                    Export as CSV
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSingleOrderExport(order.id, "json");
                                    }}
                                  >
                                    Export as JSON
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-4">
                {ordersData?.orders.map((order) => (
                  <Card key={order.id} className="hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOrder(order.id, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div
                            className="font-medium cursor-pointer"
                            onClick={() => handleOrderClick(order.id)}
                          >
                            #{order.paymentReference}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(order.total)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {order.customer.name} • {order.items.length} item(s)
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(order.createdAt),
                            "MMM dd, yyyy hh:mm a"
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {getPaymentStatusBadge(order.paymentStatus)}
                          {getFulfillmentStatusBadge(order.fulfillmentStatus)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order.id);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Payment Status Update */}
                            {getValidStatusOptions(
                              order.paymentStatus,
                              "payment"
                            ).length > 0 && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Update Payment Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {getValidStatusOptions(
                                    order.paymentStatus,
                                    "payment"
                                  ).map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUpdateStatusOrderId(order.id);
                                        setStatusUpdateType("payment");
                                        setSelectedStatus(status);
                                        setIsStatusDialogOpen(true);
                                      }}
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}

                            {/* Fulfillment Status Update */}
                            {getValidStatusOptions(
                              order.fulfillmentStatus,
                              "fulfillment"
                            ).length > 0 && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Update Fulfillment Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {getValidStatusOptions(
                                    order.fulfillmentStatus,
                                    "fulfillment"
                                  ).map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUpdateStatusOrderId(order.id);
                                        setStatusUpdateType("fulfillment");
                                        setSelectedStatus(status);
                                        setIsStatusDialogOpen(true);
                                      }}
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}

                            {/* Tracking Information */}
                            {canUpdateTracking(order) && (
                              <>
                                <DropdownMenuSeparator />

                                {order.trackingNumber ? (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Truck className="mr-2 h-4 w-4" />
                                      Tracking Info
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTrackingUpdate(
                                            order.id,
                                            "update",
                                            order.trackingNumber || undefined,
                                            order.shippingProvider || undefined
                                          );
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Update Tracking
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTrackingUpdate(
                                            order.id,
                                            "remove"
                                          );
                                        }}
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove Tracking
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTrackingUpdate(order.id, "add");
                                    }}
                                  >
                                    <Package className="mr-2 h-4 w-4" />
                                    Add Tracking
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}

                            <DropdownMenuSeparator />

                            {/* Export Options */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Export Order
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSingleOrderExport(order.id, "csv");
                                  }}
                                >
                                  Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSingleOrderExport(order.id, "json");
                                  }}
                                >
                                  Export as JSON
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!ordersLoading &&
            (!ordersData?.orders || ordersData.orders.length === 0) && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  No orders found. When customers place orders, they&apos;ll
                  appear here.
                </p>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {ordersData?.pagination && ordersData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!ordersData.pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {ordersData.pagination.page} of{" "}
            {ordersData.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!ordersData.pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Order Details
                {orderDetails && ` - #${orderDetails.paymentReference}`}
              </DialogTitle>
              {orderDetails && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleSingleOrderExport(orderDetails.id, "csv")
                      }
                      disabled={singleOrderExportMutation.isPending}
                    >
                      {singleOrderExportMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleSingleOrderExport(orderDetails.id, "json")
                      }
                      disabled={singleOrderExportMutation.isPending}
                    >
                      {singleOrderExportMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          {orderDetailsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Order ID:
                      </span>
                      <span className="text-sm font-medium">
                        #{orderDetails.paymentReference}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-sm">
                        {format(
                          new Date(orderDetails.createdAt),
                          "MMM dd, yyyy hh:mm a"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Payment Status:
                      </span>
                      {getPaymentStatusBadge(orderDetails.paymentStatus)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fulfillment Status:
                      </span>
                      {getFulfillmentStatusBadge(
                        orderDetails.fulfillmentStatus
                      )}
                    </div>
                    {orderDetails.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tracking:
                        </span>
                        <span className="text-sm font-medium">
                          {orderDetails.trackingNumber}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium">
                        {orderDetails.customer.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Email:
                      </span>
                      <span className="text-sm">
                        {orderDetails.customer.email}
                      </span>
                    </div>
                    {orderDetails.customer.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Phone:
                        </span>
                        <span className="text-sm">
                          {orderDetails.customer.phone}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          {item.variantDetails && (
                            <div className="text-sm text-muted-foreground">
                              {item.variantDetails}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Subtotal:
                      </span>
                      <span className="text-sm">
                        {formatPrice(orderDetails.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Shipping:
                      </span>
                      <span className="text-sm">
                        {formatPrice(orderDetails.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatPrice(orderDetails.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {orderDetails.shippingInfo
                ? (() => {
                    const shippingInfo =
                      orderDetails.shippingInfo as ShippingInfo;
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Shipping Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <div>
                              <div>{shippingInfo.address}</div>
                              <div>{shippingInfo.area}</div>
                              <div>{shippingInfo.state}</div>
                              <div>{shippingInfo.country}</div>
                              <div>{shippingInfo.phoneNumber}</div>
                              {shippingInfo.secondaryPhoneNumber && (
                                <div>{shippingInfo.secondaryPhoneNumber}</div>
                              )}
                              {shippingInfo.additionalInfo && (
                                <div>{shippingInfo.additionalInfo}</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()
                : null}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Failed to load order details.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Are you sure you want to update the {statusUpdateType} status to{" "}
              <span className="font-medium">{selectedStatus}</span>?
            </div>

            {statusUpdateType === "fulfillment" &&
              selectedStatus === "SHIPPED" && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  This will automatically set the shipped date to now.
                </div>
              )}

            {statusUpdateType === "fulfillment" &&
              selectedStatus === "DELIVERED" && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  This will automatically set both shipped and delivered dates
                  if not already set.
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Update Dialog */}
      <Dialog
        open={isTrackingDialogOpen}
        onOpenChange={setIsTrackingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {trackingAction === "add" && "Add Tracking Information"}
              {trackingAction === "update" && "Update Tracking Information"}
              {trackingAction === "remove" && "Remove Tracking Information"}
            </DialogTitle>
          </DialogHeader>

          {trackingAction === "remove" ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Are you sure you want to remove the tracking information for
                this order?
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Shipping Provider (Optional)
                </label>
                <Input
                  placeholder="e.g., DHL, FedEx, UPS"
                  value={shippingProvider}
                  onChange={(e) => setShippingProvider(e.target.value)}
                />
              </div>

              {trackingAction === "add" && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                  Adding tracking information will automatically update the
                  order status to &quot;Shipped&quot; if it&apos;s currently
                  &quot;Processing&quot;.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTrackingDialogOpen(false)}
              disabled={updateTrackingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmTrackingUpdate}
              disabled={updateTrackingMutation.isPending}
              variant={trackingAction === "remove" ? "destructive" : "default"}
            >
              {updateTrackingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {trackingAction === "add" && "Add Tracking"}
              {trackingAction === "update" && "Update Tracking"}
              {trackingAction === "remove" && "Remove Tracking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Orders</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Type</label>
              <div className="text-sm text-muted-foreground">
                {exportType === "selected" &&
                  `Export ${selectedOrders.size} selected orders`}
                {exportType === "filtered" &&
                  "Export orders matching current filters"}
                {exportType === "all" && "Export all orders"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select
                value={exportFormat}
                onValueChange={(value: "csv" | "json") =>
                  setExportFormat(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
              The export will include order details, customer information,
              payment status, fulfillment status, and product information.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={exportMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={confirmExport} disabled={exportMutation.isPending}>
              {exportMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Download className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
