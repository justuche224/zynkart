"use server";

import db from "@/db";
import { store, customer, order, orderItem } from "@/db/schema";
import { eq, like, or, desc, count, sum, and } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface GetCustomersParams {
  storeId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerWithStats {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export interface CustomersResponse {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getCustomers = async ({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCustomersParams): Promise<CustomersResponse> => {
  const session = await serverAuth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const storeInfo = await db.query.store.findFirst({
    columns: {
      id: true,
    },
    where: eq(store.id, storeId),
  });

  if (!storeInfo) {
    throw new Error("Store not found");
  }

  const offset = (page - 1) * limit;

  const searchConditions = search
    ? or(
        like(customer.name, `%${search}%`),
        like(customer.email, `%${search}%`),
        like(customer.phone, `%${search}%`)
      )
    : undefined;

  const whereCondition = searchConditions
    ? and(eq(customer.storeId, storeId), searchConditions)
    : eq(customer.storeId, storeId);

  const customers = await db
    .select({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
    })
    .from(customer)
    .where(whereCondition)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(customer.createdAt));

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(customer)
    .where(whereCondition);

  const customerStats = await Promise.all(
    customers.map(async (cust) => {
      const orderStats = await db
        .select({
          totalOrders: count(),
          totalSpent: sum(order.total),
        })
        .from(order)
        .where(and(eq(order.customerId, cust.id), eq(order.storeId, storeId)))
        .groupBy(order.customerId);

      const stats = orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
      };

      const lastOrder = await db
        .select({ createdAt: order.createdAt })
        .from(order)
        .where(and(eq(order.customerId, cust.id), eq(order.storeId, storeId)))
        .orderBy(desc(order.createdAt))
        .limit(1);

      return {
        ...cust,
        totalOrders: Number(stats.totalOrders) || 0,
        totalSpent: Number(stats.totalSpent) || 0,
        lastOrderDate: lastOrder[0]?.createdAt || null,
      };
    })
  );

  const totalPages = Math.ceil(totalCount / limit);

  return {
    customers: customerStats,
    total: totalCount,
    page,
    limit,
    totalPages,
  };
};

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
  lastOrder: {
    id: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    total: number;
    createdAt: Date;
  } | null;
  orderHistory: {
    id: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    total: number;
    createdAt: Date;
    itemsCount: number;
  }[];
}

export const getCustomerDetails = async (
  storeId: string,
  customerId: string
): Promise<CustomerDetails> => {
  const session = await serverAuth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const storeInfo = await db.query.store.findFirst({
    columns: { id: true },
    where: eq(store.id, storeId),
  });

  if (!storeInfo) {
    throw new Error("Store not found");
  }

  const customerInfo = await db.query.customer.findFirst({
    where: and(eq(customer.id, customerId), eq(customer.storeId, storeId)),
  });

  if (!customerInfo) {
    throw new Error("Customer not found");
  }

  const orderStats = await db
    .select({
      totalOrders: count(),
      totalSpent: sum(order.total),
    })
    .from(order)
    .where(and(eq(order.customerId, customerId), eq(order.storeId, storeId)));

  const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

  const lastOrderResult = await db
    .select({
      id: order.id,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      total: order.total,
      createdAt: order.createdAt,
    })
    .from(order)
    .where(and(eq(order.customerId, customerId), eq(order.storeId, storeId)))
    .orderBy(desc(order.createdAt))
    .limit(1);

  const orderHistory = await db
    .select({
      id: order.id,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      total: order.total,
      createdAt: order.createdAt,
      itemsCount: count(orderItem.id),
    })
    .from(order)
    .leftJoin(orderItem, eq(order.id, orderItem.orderId))
    .where(and(eq(order.customerId, customerId), eq(order.storeId, storeId)))
    .groupBy(
      order.id,
      order.paymentStatus,
      order.fulfillmentStatus,
      order.total,
      order.createdAt
    )
    .orderBy(desc(order.createdAt))
    .limit(10);

  return {
    id: customerInfo.id,
    name: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    image: customerInfo.image,
    createdAt: customerInfo.createdAt,
    updatedAt: customerInfo.updatedAt,
    totalOrders: Number(stats.totalOrders) || 0,
    totalSpent: Number(stats.totalSpent) || 0,
    lastOrderDate: lastOrderResult[0]?.createdAt || null,
    lastOrder: lastOrderResult[0] || null,
    orderHistory: orderHistory.map((order) => ({
      ...order,
      itemsCount: Number(order.itemsCount) || 0,
    })),
  };
};
