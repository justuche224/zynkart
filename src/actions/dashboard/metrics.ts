"use server";

import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { order, customer, storeVisit, product } from "@/db/schema";
import { and, eq, gte, lt, sum, count, gt } from "drizzle-orm";

const getDateRanges = (days: number) => {
  const now = new Date();
  const currentPeriodStart = new Date(
    now.getTime() - days * 24 * 60 * 60 * 1000
  );
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - days * 24 * 60 * 60 * 1000
  );

  return {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd: now,
    previousPeriodEnd: currentPeriodStart,
  };
};

const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const totalRevenue = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentRevenue = await db
    .select({ total: sum(order.total) })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, currentPeriodStart),
        lt(order.createdAt, currentPeriodEnd)
      )
    );

  const previousRevenue = await db
    .select({ total: sum(order.total) })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, previousPeriodStart),
        lt(order.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = Number(currentRevenue[0]?.total || 0);
  const previousValue = Number(previousRevenue[0]?.total || 0);
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};

export const totalOrders = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentOrders = await db
    .select({ count: count() })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        gte(order.createdAt, currentPeriodStart),
        lt(order.createdAt, currentPeriodEnd)
      )
    );

  const previousOrders = await db
    .select({ count: count() })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        gte(order.createdAt, previousPeriodStart),
        lt(order.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = currentOrders[0]?.count || 0;
  const previousValue = previousOrders[0]?.count || 0;
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};

export const totalCustomers = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentCustomers = await db
    .select({ count: count() })
    .from(customer)
    .where(
      and(
        eq(customer.storeId, storeId),
        gte(customer.createdAt, currentPeriodStart),
        lt(customer.createdAt, currentPeriodEnd)
      )
    );

  const previousCustomers = await db
    .select({ count: count() })
    .from(customer)
    .where(
      and(
        eq(customer.storeId, storeId),
        gte(customer.createdAt, previousPeriodStart),
        lt(customer.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = currentCustomers[0]?.count || 0;
  const previousValue = previousCustomers[0]?.count || 0;
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};

export const totalVisits = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentVisits = await db
    .select({ count: count() })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, currentPeriodStart),
        lt(storeVisit.createdAt, currentPeriodEnd)
      )
    );

  const previousVisits = await db
    .select({ count: count() })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, previousPeriodStart),
        lt(storeVisit.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = currentVisits[0]?.count || 0;
  const previousValue = previousVisits[0]?.count || 0;
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};

export const avgOrderValue = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentData = await db
    .select({
      totalRevenue: sum(order.total),
      orderCount: count(),
    })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, currentPeriodStart),
        lt(order.createdAt, currentPeriodEnd)
      )
    );

  const previousData = await db
    .select({
      totalRevenue: sum(order.total),
      orderCount: count(),
    })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, previousPeriodStart),
        lt(order.createdAt, previousPeriodEnd)
      )
    );

  const currentRevenue = Number(currentData[0]?.totalRevenue || 0);
  const currentOrders = currentData[0]?.orderCount || 0;
  const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

  const previousRevenue = Number(previousData[0]?.totalRevenue || 0);
  const previousOrders = previousData[0]?.orderCount || 0;
  const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

  const change = calculatePercentageChange(currentAOV, previousAOV);

  return {
    value: Math.round(currentAOV * 100) / 100,
    change: Math.round(change * 100) / 100,
  };
};

export const conversionRate = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    currentPeriodStart,
    previousPeriodStart,
    currentPeriodEnd,
    previousPeriodEnd,
  } = getDateRanges(days);

  const currentOrders = await db
    .select({ count: count() })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        gte(order.createdAt, currentPeriodStart),
        lt(order.createdAt, currentPeriodEnd)
      )
    );

  const currentVisits = await db
    .select({ count: count() })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, currentPeriodStart),
        lt(storeVisit.createdAt, currentPeriodEnd)
      )
    );

  const previousOrders = await db
    .select({ count: count() })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        gte(order.createdAt, previousPeriodStart),
        lt(order.createdAt, previousPeriodEnd)
      )
    );

  const previousVisits = await db
    .select({ count: count() })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, previousPeriodStart),
        lt(storeVisit.createdAt, previousPeriodEnd)
      )
    );

  const currentOrderCount = currentOrders[0]?.count || 0;
  const currentVisitCount = currentVisits[0]?.count || 0;
  const currentConversion =
    currentVisitCount > 0 ? (currentOrderCount / currentVisitCount) * 100 : 0;

  const previousOrderCount = previousOrders[0]?.count || 0;
  const previousVisitCount = previousVisits[0]?.count || 0;
  const previousConversion =
    previousVisitCount > 0
      ? (previousOrderCount / previousVisitCount) * 100
      : 0;

  const change = calculatePercentageChange(
    currentConversion,
    previousConversion
  );

  return {
    value: Math.round(currentConversion * 100) / 100,
    change: Math.round(change * 100) / 100,
  };
};

export const totalProducts = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { previousPeriodEnd } = getDateRanges(days);

  const currentProducts = await db
    .select({ count: count() })
    .from(product)
    .where(and(eq(product.storeId, storeId), eq(product.status, "ACTIVE")));

  const previousProducts = await db
    .select({ count: count() })
    .from(product)
    .where(
      and(
        eq(product.storeId, storeId),
        eq(product.status, "ACTIVE"),
        lt(product.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = currentProducts[0]?.count || 0;
  const previousValue = previousProducts[0]?.count || 0;
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};

export const productsInStock = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { previousPeriodEnd } = getDateRanges(days);

  const currentInStock = await db
    .select({ count: count() })
    .from(product)
    .where(
      and(
        eq(product.storeId, storeId),
        eq(product.status, "ACTIVE"),
        gt(product.inStock, 0)
      )
    );

  const previousInStock = await db
    .select({ count: count() })
    .from(product)
    .where(
      and(
        eq(product.storeId, storeId),
        eq(product.status, "ACTIVE"),
        gt(product.inStock, 0),
        lt(product.createdAt, previousPeriodEnd)
      )
    );

  const currentValue = currentInStock[0]?.count || 0;
  const previousValue = previousInStock[0]?.count || 0;
  const change = calculatePercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    change: Math.round(change * 100) / 100,
  };
};
