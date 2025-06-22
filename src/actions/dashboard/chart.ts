"use server";

import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import {
  order,
  storeVisit,
  orderItem,
  product,
  category,
  customer,
} from "@/db/schema";
import {
  and,
  eq,
  gte,
  lt,
  sum,
  count,
  sql,
  isNotNull,
  desc,
} from "drizzle-orm";

export const getSalesChartData = async (storeId: string, days: number) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const salesData = await db
    .select({
      date: sql<string>`DATE(${order.createdAt})`.as("date"),
      totalSales: sum(order.total).as("totalSales"),
      orderCount: count(order.id).as("orderCount"),
    })
    .from(order)
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, startDate),
        lt(order.createdAt, now)
      )
    )
    .groupBy(sql`DATE(${order.createdAt})`)
    .orderBy(sql`DATE(${order.createdAt})`);

  const visitorsData = await db
    .select({
      date: sql<string>`DATE(${storeVisit.createdAt})`.as("date"),
      visitorCount: count(storeVisit.id).as("visitorCount"),
    })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, startDate),
        lt(storeVisit.createdAt, now)
      )
    )
    .groupBy(sql`DATE(${storeVisit.createdAt})`)
    .orderBy(sql`DATE(${storeVisit.createdAt})`);

  const visitorsMap = new Map(
    visitorsData.map((v) => [v.date, Number(v.visitorCount)])
  );

  const chartData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    const salesForDate = salesData.find((s) => s.date === dateString);

    chartData.push({
      date: dateString,
      sales: salesForDate ? Number(salesForDate.totalSales) : 0,
      orders: salesForDate ? Number(salesForDate.orderCount) : 0,
      visitors: visitorsMap.get(dateString) || 0,
    });
  }

  return chartData;
};

export const getCategoryPerformanceData = async (
  storeId: string,
  days: number
) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const categoryPerformance = await db
    .select({
      categoryId: category.id,
      categoryName: category.name,
      totalSales:
        sql<string>`SUM(${orderItem.price} * ${orderItem.quantity})`.as(
          "totalSales"
        ),
      orderCount: count(sql`DISTINCT ${order.id}`).as("orderCount"),
      productCount: count(sql`DISTINCT ${product.id}`).as("productCount"),
    })
    .from(order)
    .innerJoin(orderItem, eq(order.id, orderItem.orderId))
    .innerJoin(product, eq(orderItem.productId, product.id))
    .innerJoin(category, eq(product.categoryId, category.id))
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, startDate),
        lt(order.createdAt, now)
      )
    )
    .groupBy(category.id, category.name)
    .orderBy(sql`SUM(${orderItem.price} * ${orderItem.quantity}) DESC`);

  const totalSales = categoryPerformance.reduce(
    (acc, cat) => acc + Number(cat.totalSales || 0),
    0
  );

  const chartData = categoryPerformance.map((category) => {
    const sales = Number(category.totalSales || 0);
    const percentage =
      totalSales > 0
        ? (Number(category.totalSales || 0) / totalSales) * 100
        : 0;

    return {
      name: category.categoryName,
      value: Math.round(percentage * 10) / 10, // Round to 1 decimal place
      sales: sales,
      orders: Number(category.orderCount || 0),
      products: Number(category.productCount || 0),
    };
  });

  if (chartData.length === 0) {
    return [];
  }

  // Limit to top 5 categories and group others
  const topCategories = chartData.slice(0, 4);
  const otherCategories = chartData.slice(4);

  if (otherCategories.length > 0) {
    const othersData = {
      name: "Others",
      value: otherCategories.reduce((acc, cat) => acc + cat.value, 0),
      sales: otherCategories.reduce((acc, cat) => acc + cat.sales, 0),
      orders: otherCategories.reduce((acc, cat) => acc + cat.orders, 0),
      products: otherCategories.reduce((acc, cat) => acc + cat.products, 0),
    };

    return [...topCategories, othersData];
  }

  return topCategories;
};

export const getRecentOrdersData = async (
  storeId: string,
  limit: number = 5
) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const recentOrders = await db
    .select({
      id: order.id,
      total: order.total,
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerName: customer.name,
      customerEmail: customer.email,
    })
    .from(order)
    .innerJoin(customer, eq(order.customerId, customer.id))
    .where(eq(order.storeId, storeId))
    .orderBy(sql`${order.createdAt} DESC`)
    .limit(limit);

  return recentOrders.map((order) => ({
    id: order.id,
    customer: order.customerName,
    email: order.customerEmail,
    total: Number(order.total),
    status: order.fulfillmentStatus,
    paymentStatus: order.paymentStatus,
    date: order.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    createdAt: order.createdAt,
  }));
};

export const getTopProductsData = async (
  storeId: string,
  days: number,
  limit: number = 5
) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const topProducts = await db
    .select({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productTrackQuantity: product.trackQuantity,
      categoryName: category.name,
      totalRevenue:
        sql<string>`SUM(${orderItem.price} * ${orderItem.quantity})`.as(
          "totalRevenue"
        ),
      totalQuantitySold: sql<string>`SUM(${orderItem.quantity})`.as(
        "totalQuantitySold"
      ),
      orderCount: count(sql`DISTINCT ${order.id}`).as("orderCount"),
      inStock: product.inStock,
    })
    .from(orderItem)
    .innerJoin(order, eq(orderItem.orderId, order.id))
    .innerJoin(product, eq(orderItem.productId, product.id))
    .innerJoin(category, eq(product.categoryId, category.id))
    .where(
      and(
        eq(order.storeId, storeId),
        eq(order.paymentStatus, "PAID"),
        gte(order.createdAt, startDate),
        lt(order.createdAt, now)
      )
    )
    .groupBy(
      product.id,
      product.name,
      product.slug,
      category.name,
      product.inStock,
      product.trackQuantity
    )
    .orderBy(sql`SUM(${orderItem.price} * ${orderItem.quantity}) DESC`)
    .limit(limit);

  return topProducts.map((product, index) => ({
    id: product.productId,
    name: product.productName,
    slug: product.productSlug,
    category: product.categoryName,
    trackQuantity: product.productTrackQuantity,
    sales: Number(product.totalQuantitySold || 0),
    revenue: Number(product.totalRevenue || 0),
    orders: Number(product.orderCount || 0),
    inStock: product.inStock,
    rank: index + 1,
  }));
};

export const getVisitorAnalyticsData = async (
  storeId: string,
  days: number
) => {
  const session = await serverAuth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const dailyVisitors = await db
    .select({
      date: sql<string>`DATE(${storeVisit.createdAt})`.as("date"),
      visitors: count().as("visitors"),
    })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, startDate),
        lt(storeVisit.createdAt, now)
      )
    )
    .groupBy(sql`DATE(${storeVisit.createdAt})`)
    .orderBy(sql`DATE(${storeVisit.createdAt})`);

  // Fill in missing dates with 0 visitors
  const dailyVisitorsMap = new Map(
    dailyVisitors.map((item) => [item.date, Number(item.visitors)])
  );

  const filledDailyData = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = currentDate.toISOString().split("T")[0];

    filledDailyData.push({
      date: dateString,
      visitors: dailyVisitorsMap.get(dateString) || 0,
    });
  }

  // Get OS breakdown
  const osBreakdown = await db
    .select({
      os: storeVisit.os,
      visits: count().as("visits"),
    })
    .from(storeVisit)
    .where(
      and(
        eq(storeVisit.storeId, storeId),
        gte(storeVisit.createdAt, startDate),
        lt(storeVisit.createdAt, now),
        isNotNull(storeVisit.os)
      )
    )
    .groupBy(storeVisit.os)
    .orderBy(desc(count()));

  const totalVisits = osBreakdown.reduce(
    (sum, item) => sum + Number(item.visits),
    0
  );

  const formattedOsData = osBreakdown.map((item, index) => ({
    os: item.os || "Unknown",
    visits: Number(item.visits),
    percentage: totalVisits > 0 ? (Number(item.visits) / totalVisits) * 100 : 0,
    rank: index + 1,
  }));

  return {
    dailyVisitors: filledDailyData,
    osBreakdown: formattedOsData,
    totalVisits,
  };
};
