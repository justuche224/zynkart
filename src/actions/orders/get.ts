"use server";

import db from "@/db";
import { order, orderItem, customer, product } from "@/db/schema";
import {
  eq,
  and,
  gte,
  lte,
  ilike,
  or,
  desc,
  asc,
  count,
  sql,
  inArray,
} from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface GetStoreOrdersParams {
  storeId: string;
  page?: number;
  limit?: number;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  minDate?: Date;
  maxDate?: Date;
  customerId?: string;
  search?: string;
  sort?: string;
  orderBy?: "asc" | "desc";
}

export interface OrderResult {
  id: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentReference: string;
  subtotal: number;
  total: number;
  shippingCost: number;
  shippingInfo: any;
  trackingNumber: string | null;
  shippingProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    productName: string;
    variantDetails: string | null;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface GetStoreOrdersResponse {
  orders: OrderResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  };
}

export async function getStoreOrders(
  params: GetStoreOrdersParams
): Promise<GetStoreOrdersResponse> {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  try {
    const {
      storeId,
      page = 1,
      limit = 10,
      paymentStatus,
      fulfillmentStatus,
      minPrice,
      maxPrice,
      minDate,
      maxDate,
      customerId,
      search,
      sort = "createdAt",
      orderBy = "desc",
    } = params;

    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const offset = (pageNum - 1) * limitNum;

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

    if (minPrice !== undefined && minPrice >= 0) {
      whereConditions.push(gte(order.total, minPrice));
    }
    if (maxPrice !== undefined && maxPrice >= 0) {
      whereConditions.push(lte(order.total, maxPrice));
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

    const buildSearchConditions = (baseConditions: any[]) => {
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        return and(
          ...baseConditions,
          or(
            ilike(order.paymentReference, searchTerm),
            ilike(order.trackingNumber, searchTerm),
            ilike(customer.name, searchTerm),
            ilike(customer.email, searchTerm)
          )
        );
      }
      return and(...baseConditions);
    };

    const validSortFields = [
      "createdAt",
      "updatedAt",
      "total",
      "paymentStatus",
      "fulfillmentStatus",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "createdAt";
    const sortDirection = orderBy === "asc" ? asc : desc;

    let orderByClause;
    switch (sortField) {
      case "createdAt":
        orderByClause = sortDirection(order.createdAt);
        break;
      case "updatedAt":
        orderByClause = sortDirection(order.updatedAt);
        break;
      case "total":
        orderByClause = sortDirection(order.total);
        break;
      case "paymentStatus":
        orderByClause = sortDirection(order.paymentStatus);
        break;
      case "fulfillmentStatus":
        orderByClause = sortDirection(order.fulfillmentStatus);
        break;
      default:
        orderByClause = sortDirection(order.createdAt);
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(buildSearchConditions(whereConditions));

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limitNum);


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
          shippingInfo: order.shippingInfo,
          trackingNumber: order.trackingNumber,
          shippingProvider: order.shippingProvider,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
        },
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(buildSearchConditions(whereConditions))
      .orderBy(orderByClause)
      .limit(limitNum)
      .offset(offset);

    const orderIds = orders.map((o) => o.order.id);
    let orderItemsMap: Record<string, Array<any>> = {};

    if (orderIds.length > 0) {
      const orderItemsResult = await db
        .select({
          orderItem: {
            id: orderItem.id,
            orderId: orderItem.orderId,
            quantity: orderItem.quantity,
            productName: orderItem.productName,
            variantDetails: orderItem.variantDetails,
            price: orderItem.price,
          },
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
        })
        .from(orderItem)
        .leftJoin(product, eq(orderItem.productId, product.id))
        .where(inArray(orderItem.orderId, orderIds));

      orderItemsMap = orderItemsResult.reduce((acc, item) => {
        const orderId = item.orderItem.orderId;
        if (!acc[orderId]) {
          acc[orderId] = [];
        }
        acc[orderId].push({
          id: item.orderItem.id,
          quantity: item.orderItem.quantity,
          productName: item.orderItem.productName,
          variantDetails: item.orderItem.variantDetails,
          price: item.orderItem.price,
          product: item.product,
        });
        return acc;
      }, {} as Record<string, Array<any>>);
    }

    const [summaryResult] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${order.total}), 0)`,
        pendingOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PENDING' THEN 1 END)`,
        paidOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PAID' THEN 1 END)`,
        processingOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'PROCESSING' THEN 1 END)`,
        shippedOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'SHIPPED' THEN 1 END)`,
        deliveredOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'DELIVERED' THEN 1 END)`,
      })
      .from(order)
      .where(eq(order.storeId, storeId));

    const formattedOrders: OrderResult[] = orders.map((orderData) => ({
      id: orderData.order.id,
      paymentStatus: orderData.order.paymentStatus,
      fulfillmentStatus: orderData.order.fulfillmentStatus,
      paymentReference: orderData.order.paymentReference,
      subtotal: orderData.order.subtotal,
      total: orderData.order.total,
      shippingCost: orderData.order.shippingCost,
      shippingInfo: orderData.order.shippingInfo,
      trackingNumber: orderData.order.trackingNumber,
      shippingProvider: orderData.order.shippingProvider,
      createdAt: orderData.order.createdAt,
      updatedAt: orderData.order.updatedAt,
      shippedAt: orderData.order.shippedAt,
      deliveredAt: orderData.order.deliveredAt,
      customer: {
        id: orderData.customer?.id || "",
        name: orderData.customer?.name || "",
        email: orderData.customer?.email || "",
        phone: orderData.customer?.phone || null,
      },
      items: orderItemsMap[orderData.order.id] || [],
    }));

    return {
      orders: formattedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      summary: {
        totalOrders: summaryResult.totalOrders,
        totalRevenue: Number(summaryResult.totalRevenue),
        pendingOrders: Number(summaryResult.pendingOrders),
        paidOrders: Number(summaryResult.paidOrders),
        processingOrders: Number(summaryResult.processingOrders),
        shippedOrders: Number(summaryResult.shippedOrders),
        deliveredOrders: Number(summaryResult.deliveredOrders),
      },
    };
  } catch (error) {
    console.error("Error fetching store orders:", error);
    throw new Error("Failed to get store orders");
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string, storeId?: string) {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const whereConditions = [eq(order.id, orderId)];
    if (storeId) {
      whereConditions.push(eq(order.storeId, storeId));
    }

    const [orderResult] = await db
      .select({
        order: {
          id: order.id,
          storeId: order.storeId,
          customerId: order.customerId,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          paymentReference: order.paymentReference,
          paymentAccessCode: order.paymentAccessCode,
          subtotal: order.subtotal,
          total: order.total,
          shippingCost: order.shippingCost,
          shippingInfo: order.shippingInfo,
          trackingNumber: order.trackingNumber,
          shippingProvider: order.shippingProvider,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
        },
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          image: customer.image,
        },
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(and(...whereConditions));

    if (!orderResult) {
      throw new Error("Order not found");
    }

    const orderItemsResult = await db
      .select({
        orderItem: {
          id: orderItem.id,
          quantity: orderItem.quantity,
          productName: orderItem.productName,
          variantDetails: orderItem.variantDetails,
          price: orderItem.price,
        },
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
        },
      })
      .from(orderItem)
      .leftJoin(product, eq(orderItem.productId, product.id))
      .where(eq(orderItem.orderId, orderId));

    return {
      id: orderResult.order.id,
      storeId: orderResult.order.storeId,
      customerId: orderResult.order.customerId,
      paymentStatus: orderResult.order.paymentStatus,
      fulfillmentStatus: orderResult.order.fulfillmentStatus,
      paymentReference: orderResult.order.paymentReference,
      paymentAccessCode: orderResult.order.paymentAccessCode,
      subtotal: orderResult.order.subtotal,
      total: orderResult.order.total,
      shippingCost: orderResult.order.shippingCost,
      shippingInfo: orderResult.order.shippingInfo,
      trackingNumber: orderResult.order.trackingNumber,
      shippingProvider: orderResult.order.shippingProvider,
      createdAt: orderResult.order.createdAt,
      updatedAt: orderResult.order.updatedAt,
      shippedAt: orderResult.order.shippedAt,
      deliveredAt: orderResult.order.deliveredAt,
      customer: {
        id: orderResult.customer?.id || "",
        name: orderResult.customer?.name || "",
        email: orderResult.customer?.email || "",
        phone: orderResult.customer?.phone || null,
        image: orderResult.customer?.image || null,
      },
      items: orderItemsResult.map((item) => ({
        id: item.orderItem.id,
        quantity: item.orderItem.quantity,
        productName: item.orderItem.productName,
        variantDetails: item.orderItem.variantDetails,
        price: item.orderItem.price,
        product: item.product,
      })),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get order"
    );
  }
}

/**
 * Get order statistics for a store
 */
export async function getOrderStats(storeId: string, days?: number) {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const whereConditions = [eq(order.storeId, storeId)];

    if (days && days > 0) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      whereConditions.push(gte(order.createdAt, dateThreshold));
    }

    const [stats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${order.total}), 0)`,
        averageOrderValue: sql<number>`COALESCE(AVG(${order.total}), 0)`,
        pendingOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PENDING' THEN 1 END)`,
        paidOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PAID' THEN 1 END)`,
        failedOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'FAILED' THEN 1 END)`,
        refundedOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'REFUNDED' THEN 1 END)`,
        processingOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'PROCESSING' THEN 1 END)`,
        shippedOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'SHIPPED' THEN 1 END)`,
        deliveredOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'DELIVERED' THEN 1 END)`,
        cancelledOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'CANCELLED' THEN 1 END)`,
      })
      .from(order)
      .where(and(...whereConditions));

    return {
      totalOrders: Number(stats.totalOrders),
      totalRevenue: Number(stats.totalRevenue),
      averageOrderValue: Number(stats.averageOrderValue),
      paymentStats: {
        pending: Number(stats.pendingOrders),
        paid: Number(stats.paidOrders),
        failed: Number(stats.failedOrders),
        refunded: Number(stats.refundedOrders),
      },
      fulfillmentStats: {
        processing: Number(stats.processingOrders),
        shipped: Number(stats.shippedOrders),
        delivered: Number(stats.deliveredOrders),
        cancelled: Number(stats.cancelledOrders),
      },
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw new Error("Failed to get order statistics");
  }
}

/**
 * Get recent orders for a store
 */
export async function getRecentOrders(storeId: string, limit: number = 10) {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    const limitNum = Math.min(Math.max(1, limit), 50);

    const orders = await db
      .select({
        id: order.id,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentReference: order.paymentReference,
        total: order.total,
        createdAt: order.createdAt,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
      })
      .from(order)
      .leftJoin(customer, eq(order.customerId, customer.id))
      .where(eq(order.storeId, storeId))
      .orderBy(desc(order.createdAt))
      .limit(limitNum);

    return orders.map((orderData) => ({
      id: orderData.id,
      paymentStatus: orderData.paymentStatus,
      fulfillmentStatus: orderData.fulfillmentStatus,
      paymentReference: orderData.paymentReference,
      total: orderData.total,
      createdAt: orderData.createdAt,
      customer: {
        id: orderData.customer?.id || "",
        name: orderData.customer?.name || "",
        email: orderData.customer?.email || "",
      },
    }));
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to get recent orders");
  }
}
