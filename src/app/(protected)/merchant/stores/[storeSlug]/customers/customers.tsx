"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCustomers,
  getCustomerDetails,
  type CustomerDetails,
} from "@/actions/customers/get";
import formatPrice from "@/lib/price-formatter";

interface CustomersProps {
  storeId: string;
}

export const Customers = ({ storeId }: CustomersProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParamsPage = searchParams.get("page") || 1;
  const searchParamsSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(Number(searchParamsPage));
  const [search, setSearch] = useState(searchParamsSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParamsSearch);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const limit = 50;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== searchParamsSearch) {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, searchParamsSearch]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (page !== 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      const newUrl = newParamsString
        ? `${pathname}?${newParamsString}`
        : pathname;
      router.push(newUrl, { scroll: false });
    }
  }, [page, debouncedSearch, searchParams, pathname, router]);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers", storeId, page, debouncedSearch.trim()],
    queryFn: () =>
      getCustomers({
        storeId,
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["customer-details", storeId, selectedCustomerId],
    queryFn: () =>
      selectedCustomerId
        ? getCustomerDetails(storeId, selectedCustomerId)
        : null,
    enabled: !!selectedCustomerId,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4">
        {/* Header and Search Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-lg">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-5 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="block md:hidden space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton for Desktop */}
        <Card className="hidden md:block">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Orders",
                    "Total Spent",
                    "Last Order",
                    "Joined",
                    "Actions",
                  ].map((header) => (
                    <TableHead key={header}>
                      <Skeleton className="h-4 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-lg">
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total
          </div>
          <div className="text-lg sm:text-xl font-bold">
            {customersData?.total || 0}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">
            Active
          </div>
          <div className="text-lg sm:text-xl font-bold">
            {customersData?.customers.filter((c) => c.totalOrders > 0).length ||
              0}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Revenue
          </div>
          <div className="text-xs sm:text-lg font-bold">
            {formatPrice(
              customersData?.customers.reduce(
                (sum, c) => sum + c.totalSpent,
                0
              ) || 0
            )}
          </div>
        </div>
      </div>

      {/* Mobile-friendly card layout for small screens */}
      <div className="block md:hidden space-y-4">
        {customersData?.customers.map((customer) => (
          <div key={customer.id} className="p-4 border rounded-lg bg-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-foreground">
                  {customer.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="text-sm text-muted-foreground">
                    {customer.phone}
                  </div>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Customer Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-2">
                    <CustomerDetailsView
                      customerDetails={customerDetails}
                      isLoading={isLoadingDetails}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Orders: </span>
                <Badge
                  variant={customer.totalOrders > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {customer.totalOrders}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Spent: </span>
                <span className="font-medium">
                  {formatPrice(customer.totalSpent)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Order: </span>
                <span>{formatDate(customer.lastOrderDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Joined: </span>
                <span>{formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table layout for larger screens */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersData?.customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.totalOrders > 0 ? "default" : "secondary"
                      }
                    >
                      {customer.totalOrders}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(customer.totalSpent)}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomerId(customer.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-2">
                          <CustomerDetailsView
                            customerDetails={customerDetails}
                            isLoading={isLoadingDetails}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {customersData && customersData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, customersData.total)} of{" "}
                {customersData.total} customers
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {customersData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === customersData.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Pagination */}
      {customersData && customersData.totalPages > 1 && (
        <div className="block md:hidden">
          <div className="text-sm text-gray-500 text-center mb-4">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, customersData.total)} of{" "}
            {customersData.total} customers
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {customersData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === customersData.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CustomerDetailsViewProps {
  customerDetails: CustomerDetails | null | undefined;
  isLoading: boolean;
}

const CustomerDetailsView = ({
  customerDetails,
  isLoading,
}: CustomerDetailsViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Customer Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>

        {/* Last Order Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order History Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Order ID",
                      "Date",
                      "Items",
                      "Total",
                      "Payment",
                      "Fulfillment",
                    ].map((header) => (
                      <TableHead key={header} className="text-xs">
                        <Skeleton className="h-3 w-full" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerDetails) {
    return <div className="text-center py-8">Customer details not found.</div>;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PAID: "default",
      PENDING: "outline",
      FAILED: "destructive",
      REFUNDED: "secondary",
      PROCESSING: "outline",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div>
              <strong>Name:</strong> {customerDetails.name}
            </div>
            <div>
              <strong>Email:</strong> {customerDetails.email}
            </div>
            <div>
              <strong>Phone:</strong> {customerDetails.phone || "N/A"}
            </div>
            <div>
              <strong>Joined:</strong> {formatDate(customerDetails.createdAt)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div>
              <strong>Total Orders:</strong> {customerDetails.totalOrders}
            </div>
            <div>
              <strong>Total Spent:</strong>{" "}
              {formatPrice(customerDetails.totalSpent)}
            </div>
            <div>
              <strong>Last Order:</strong>{" "}
              {formatDate(customerDetails.lastOrderDate)}
            </div>
            <div>
              <strong>Average Order:</strong>{" "}
              {customerDetails.totalOrders > 0
                ? formatPrice(
                    customerDetails.totalSpent / customerDetails.totalOrders
                  )
                : formatPrice(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Order */}
      {customerDetails.lastOrder && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Last Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="font-medium">Order ID</div>
                <div className="text-gray-600 text-xs font-mono">
                  {customerDetails.lastOrder.id.slice(0, 8)}...
                </div>
              </div>
              <div>
                <div className="font-medium">Total</div>
                <div className="text-gray-600">
                  {formatPrice(customerDetails.lastOrder.total)}
                </div>
              </div>
              <div>
                <div className="font-medium">Payment</div>
                <div>
                  {getStatusBadge(customerDetails.lastOrder.paymentStatus)}
                </div>
              </div>
              <div>
                <div className="font-medium">Fulfillment</div>
                <div>
                  {getStatusBadge(customerDetails.lastOrder.fulfillmentStatus)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {customerDetails.orderHistory.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Payment</TableHead>
                    <TableHead className="text-xs">Fulfillment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerDetails.orderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.itemsCount}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.fulfillmentStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              No orders found for this customer.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
