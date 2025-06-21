"use server";

import db from "@/db";
import { order, orderItem, customer } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface ExportOrdersParams {
  storeId: string;
  format?: "csv" | "json";
  paymentStatus?: string;
  fulfillmentStatus?: string;
  minDate?: Date;
  maxDate?: Date;
  customerId?: string;
  limit?: number;
  orderIds?: string[];
}

export interface ExportOrderData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentReference: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber: string | null;
  shippingProvider: string | null;
  shippedDate: string | null;
  deliveredDate: string | null;
  itemsCount: number;
  productNames: string;
}

/**
 * Export orders data
 */
export async function exportOrders(params: ExportOrdersParams) {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const {
      storeId,
      format = "csv",
      paymentStatus,
      fulfillmentStatus,
      minDate,
      maxDate,
      customerId,
      limit = 1000,
    } = params;

    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const whereConditions = [eq(order.storeId, storeId)];

    if (
      paymentStatus &&
      ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)
    ) {
      whereConditions.push(eq(order.paymentStatus, paymentStatus as any));
    }

    if (
      fulfillmentStatus &&
      ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
        fulfillmentStatus
      )
    ) {
      whereConditions.push(
        eq(order.fulfillmentStatus, fulfillmentStatus as any)
      );
    }

    if (minDate) {
      whereConditions.push(gte(order.createdAt, minDate));
    }

    if (maxDate) {
      whereConditions.push(lte(order.createdAt, maxDate));
    }

    if (customerId) {
      whereConditions.push(eq(order.customerId, customerId));
    }

    if (params.orderIds && params.orderIds.length > 0) {
      whereConditions.push(inArray(order.id, params.orderIds));
    }

    const whereClause = and(...whereConditions);

    const orders = await db
      .select({
        order: {
          id: order.id,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          paymentReference: order.paymentReference,
          subtotal: order.subtotal,
          total: order.total,
          shippingCost: order.shippingCost,
          trackingNumber: order.trackingNumber,
          shippingProvider: order.shippingProvider,
          createdAt: order.createdAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
        },
        customer: {
          name: customer.name,
          email: customer.email,
        },
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(whereClause)
      .orderBy(order.createdAt)
      .limit(Math.min(limit, 10000));

    const orderIds = orders.map((o) => o.order.id);
    let orderItemsMap: Record<string, Array<any>> = {};

    if (orderIds.length > 0) {
      const orderItemsResult = await db
        .select({
          orderId: orderItem.orderId,
          quantity: orderItem.quantity,
          productName: orderItem.productName,
          price: orderItem.price,
        })
        .from(orderItem)
        .where(inArray(orderItem.orderId, orderIds));

      orderItemsMap = orderItemsResult.reduce((acc, item) => {
        const orderId = item.orderId;
        if (!acc[orderId]) {
          acc[orderId] = [];
        }
        acc[orderId].push(item);
        return acc;
      }, {} as Record<string, Array<any>>);
    }

    const exportData: ExportOrderData[] = orders.map((orderData) => {
      const items = orderItemsMap[orderData.order.id] || [];
      const productNames = items.map((item) => item.productName).join("; ");

      return {
        orderId: orderData.order.id,
        orderDate: orderData.order.createdAt.toISOString().split("T")[0],
        customerName: orderData.customer?.name || "N/A",
        customerEmail: orderData.customer?.email || "N/A",
        paymentStatus: orderData.order.paymentStatus,
        fulfillmentStatus: orderData.order.fulfillmentStatus,
        paymentReference: orderData.order.paymentReference,
        subtotal: orderData.order.subtotal,
        shippingCost: orderData.order.shippingCost,
        total: orderData.order.total,
        trackingNumber: orderData.order.trackingNumber,
        shippingProvider: orderData.order.shippingProvider,
        shippedDate: orderData.order.shippedAt
          ? orderData.order.shippedAt.toISOString().split("T")[0]
          : null,
        deliveredDate: orderData.order.deliveredAt
          ? orderData.order.deliveredAt.toISOString().split("T")[0]
          : null,
        itemsCount: items.length,
        productNames: productNames,
      };
    });

    if (format === "csv") {
      return generateCSV(exportData);
    } else {
      return {
        success: true,
        format: "json",
        data: exportData,
        count: exportData.length,
        exportedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to export orders"
    );
  }
}

/**
 * Generate CSV from export data
 */
function generateCSV(data: ExportOrderData[]) {
  if (data.length === 0) {
    return {
      success: true,
      format: "csv",
      content: "No orders found for export",
      count: 0,
      exportedAt: new Date().toISOString(),
    };
  }

  const headers = [
    "Order ID",
    "Order Date",
    "Customer Name",
    "Customer Email",
    "Payment Status",
    "Fulfillment Status",
    "Payment Reference",
    "Subtotal",
    "Shipping Cost",
    "Total",
    "Tracking Number",
    "Shipping Provider",
    "Shipped Date",
    "Delivered Date",
    "Items Count",
    "Product Names",
  ];

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.orderId}"`,
        `"${row.orderDate}"`,
        `"${row.customerName}"`,
        `"${row.customerEmail}"`,
        `"${row.paymentStatus}"`,
        `"${row.fulfillmentStatus}"`,
        `"${row.paymentReference}"`,
        row.subtotal,
        row.shippingCost,
        row.total,
        `"${row.trackingNumber || ""}"`,
        `"${row.shippingProvider || ""}"`,
        `"${row.shippedDate || ""}"`,
        `"${row.deliveredDate || ""}"`,
        row.itemsCount,
        `"${row.productNames}"`,
      ].join(",")
    ),
  ];

  return {
    success: true,
    format: "csv",
    content: csvRows.join("\n"),
    count: data.length,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Export orders for a specific date range
 */
export async function exportOrdersByDateRange(
  storeId: string,
  startDate: Date,
  endDate: Date,
  format: "csv" | "json" = "csv"
) {
  return exportOrders({
    storeId,
    format,
    minDate: startDate,
    maxDate: endDate,
  });
}

/**
 * Export orders by status
 */
export async function exportOrdersByStatus(
  storeId: string,
  paymentStatus?: string,
  fulfillmentStatus?: string,
  format: "csv" | "json" = "csv"
) {
  return exportOrders({
    storeId,
    format,
    paymentStatus,
    fulfillmentStatus,
  });
}

/**
 * Quick export recent orders
 */
export async function exportRecentOrders(
  storeId: string,
  format: "csv" | "json" = "csv"
) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return exportOrdersByDateRange(storeId, thirtyDaysAgo, new Date(), format);
}

/**
 * Export a single order by ID
 */
export async function exportSingleOrder(
  orderId: string,
  storeId: string,
  format: "csv" | "json" = "csv"
) {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    if (!orderId || !storeId) {
      throw new Error("Order ID and Store ID are required");
    }

    const orders = await db
      .select({
        order: {
          id: order.id,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          paymentReference: order.paymentReference,
          subtotal: order.subtotal,
          total: order.total,
          shippingCost: order.shippingCost,
          trackingNumber: order.trackingNumber,
          shippingProvider: order.shippingProvider,
          createdAt: order.createdAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
        },
        customer: {
          name: customer.name,
          email: customer.email,
        },
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(and(eq(order.id, orderId), eq(order.storeId, storeId)))
      .limit(1);

    if (orders.length === 0) {
      throw new Error("Order not found or access denied");
    }

    const orderItemsResult = await db
      .select({
        orderId: orderItem.orderId,
        quantity: orderItem.quantity,
        productName: orderItem.productName,
        price: orderItem.price,
      })
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId));

    const orderData = orders[0];
    const items = orderItemsResult;
    const productNames = items.map((item) => item.productName).join("; ");

    const exportData: ExportOrderData = {
      orderId: orderData.order.id,
      orderDate: orderData.order.createdAt.toISOString().split("T")[0],
      customerName: orderData.customer?.name || "N/A",
      customerEmail: orderData.customer?.email || "N/A",
      paymentStatus: orderData.order.paymentStatus,
      fulfillmentStatus: orderData.order.fulfillmentStatus,
      paymentReference: orderData.order.paymentReference,
      subtotal: orderData.order.subtotal,
      shippingCost: orderData.order.shippingCost,
      total: orderData.order.total,
      trackingNumber: orderData.order.trackingNumber,
      shippingProvider: orderData.order.shippingProvider,
      shippedDate: orderData.order.shippedAt
        ? orderData.order.shippedAt.toISOString().split("T")[0]
        : null,
      deliveredDate: orderData.order.deliveredAt
        ? orderData.order.deliveredAt.toISOString().split("T")[0]
        : null,
      itemsCount: items.length,
      productNames: productNames,
    };

    if (format === "csv") {
      return generateCSV([exportData]);
    } else {
      return {
        success: true,
        format: "json",
        data: [exportData],
        count: 1,
        exportedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error exporting single order:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to export order"
    );
  }
}
