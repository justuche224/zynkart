"use server";

import db from "@/db";
import {
  product,
  category,
  tag,
  order,
  customer,
  productImage,
  productTag,
} from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";

export interface SearchResults {
  products: Array<{
    id: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    imageUrl?: string;
    categoryName?: string;
    relevanceScore?: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  orders: Array<{
    id: string;
    paymentReference: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: Date;
  }>;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    orderCount: number;
    createdAt: Date;
  }>;
  totalResults: number;
}

export const globalSearch = async (
  searchQuery: string,
  storeId: string
): Promise<SearchResults> => {
  const session = await serverAuth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!searchQuery || searchQuery.trim().length < 2) {
    return {
      products: [],
      categories: [],
      tags: [],
      orders: [],
      customers: [],
      totalResults: 0,
    };
  }

  const sanitizedQuery = searchQuery.trim();
  const searchPattern = `%${sanitizedQuery}%`;
  const exactSearchPattern = sanitizedQuery.toLowerCase();

  try {
    const [
      productsResult,
      categoriesResult,
      tagsResult,
      ordersResult,
      customersResult,
    ] = await Promise.all([
      db
        .select({
          id: product.id,
          name: product.name,
          description: product.description,
          slug: product.slug,
          price: product.price,
          imageUrl: productImage.url,
          categoryName: category.name,
          relevanceScore: sql<number>`
            CASE 
              WHEN LOWER(${product.name}) = ${exactSearchPattern} THEN 100
              WHEN LOWER(${
                product.name
              }) LIKE ${`%${exactSearchPattern}%`} THEN 80
              WHEN LOWER(${
                product.metaTitle
              }) LIKE ${`%${exactSearchPattern}%`} THEN 60
              WHEN LOWER(${
                product.description
              }) LIKE ${`%${exactSearchPattern}%`} THEN 40
              WHEN LOWER(${
                product.metaKeywords
              }) LIKE ${`%${exactSearchPattern}%`} THEN 20
              ELSE 0
            END
          `,
        })
        .from(product)
        .leftJoin(
          productImage,
          and(
            eq(productImage.productId, product.id),
            eq(productImage.isDefault, true)
          )
        )
        .leftJoin(category, eq(category.id, product.categoryId))
        .where(
          and(
            eq(product.storeId, storeId),
            eq(product.status, "ACTIVE"),
            or(
              ilike(product.name, searchPattern),
              ilike(product.description, searchPattern),
              ilike(product.metaTitle, searchPattern),
              ilike(product.metaKeywords, searchPattern)
            )
          )
        )
        .orderBy(
          sql`CASE 
            WHEN LOWER(${product.name}) = ${exactSearchPattern} THEN 100
            WHEN LOWER(${
              product.name
            }) LIKE ${`%${exactSearchPattern}%`} THEN 80
            WHEN LOWER(${
              product.metaTitle
            }) LIKE ${`%${exactSearchPattern}%`} THEN 60
            WHEN LOWER(${
              product.description
            }) LIKE ${`%${exactSearchPattern}%`} THEN 40
            WHEN LOWER(${
              product.metaKeywords
            }) LIKE ${`%${exactSearchPattern}%`} THEN 20
            ELSE 0
          END DESC`,
          product.name
        )
        .limit(15),

      db
        .select({
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl,
          productCount: sql<number>`count(DISTINCT CASE WHEN ${product.status} = 'ACTIVE' THEN ${product.id} END)::int`,
        })
        .from(category)
        .leftJoin(product, eq(product.categoryId, category.id))
        .where(
          and(
            eq(category.storeId, storeId),
            ilike(category.name, searchPattern)
          )
        )
        .groupBy(category.id, category.name, category.slug, category.imageUrl)
        .orderBy(category.name)
        .limit(12),

      db
        .select({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          productCount: sql<number>`count(DISTINCT ${productTag.productId})::int`,
        })
        .from(tag)
        .leftJoin(productTag, eq(productTag.tagId, tag.id))
        .leftJoin(
          product,
          and(
            eq(product.id, productTag.productId),
            eq(product.status, "ACTIVE")
          )
        )
        .where(and(eq(tag.storeId, storeId), ilike(tag.name, searchPattern)))
        .groupBy(tag.id, tag.name, tag.slug)
        .orderBy(tag.name)
        .limit(12),

      db
        .select({
          id: order.id,
          paymentReference: order.paymentReference,
          customerName: customer.name,
          total: order.total,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          createdAt: order.createdAt,
        })
        .from(order)
        .innerJoin(customer, eq(customer.id, order.customerId))
        .where(
          and(
            eq(order.storeId, storeId),
            ilike(order.paymentReference, searchPattern)
          )
        )
        .orderBy(desc(order.createdAt))
        .limit(10),

      db
        .select({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          orderCount: sql<number>`count(${order.id})::int`,
          createdAt: customer.createdAt,
        })
        .from(customer)
        .leftJoin(order, eq(order.customerId, customer.id))
        .where(
          and(
            eq(customer.storeId, storeId),
            or(
              ilike(customer.name, searchPattern),
              ilike(customer.email, searchPattern)
            )
          )
        )
        .groupBy(
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.createdAt
        )
        .orderBy(desc(customer.createdAt))
        .limit(10),
    ]);

    const totalResults =
      productsResult.length +
      categoriesResult.length +
      tagsResult.length +
      ordersResult.length +
      customersResult.length;

    return {
      products: productsResult.map((p) => ({
        ...p,
        imageUrl: p.imageUrl || undefined,
        categoryName: p.categoryName || undefined,
      })),
      categories: categoriesResult.map((c) => ({
        ...c,
        imageUrl: c.imageUrl || undefined,
      })),
      tags: tagsResult,
      orders: ordersResult,
      customers: customersResult.map((c) => ({
        ...c,
        phone: c.phone || undefined,
      })),
      totalResults,
    };
  } catch (error) {
    console.error("Global search error:", error);
    throw new Error("Search failed. Please try again.");
  }
};

export const getSearchSuggestions = async (
  searchQuery: string,
  storeId: string,
  limit = 5
): Promise<string[]> => {
  const session = await serverAuth();
  if (!session?.user || !searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  const sanitizedQuery = searchQuery.trim();
  const searchPattern = `%${sanitizedQuery}%`;

  try {
    const suggestions = await db
      .select({
        suggestion: product.name,
      })
      .from(product)
      .where(
        and(
          eq(product.storeId, storeId),
          eq(product.status, "ACTIVE"),
          ilike(product.name, searchPattern)
        )
      )
      .orderBy(product.name)
      .limit(limit);

    return suggestions.map((s) => s.suggestion);
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
};
