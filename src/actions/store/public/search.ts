"use server";

import db from "@/db";
import { and, eq, gte, ilike, inArray, lte, or, desc } from "drizzle-orm";
import { category, product, productTag, store, tag } from "@/db/schema";

export type SearchAndFilterParams = {
  storeId: string;
  query?: string;
  categoryId?: string;
  tagId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export const searchStore = async (params: SearchAndFilterParams) => {
  const { storeId, query, categoryId, tagId, minPrice, maxPrice } = params;
  console.log("params", params);

  const lowerCaseQuery = query?.trim().toLowerCase();

  // Run all independent queries in parallel
  const [
    categories,
    productsByNameOrDesc,
    productsByQueryTag,
    productsByTagFilter,
  ] = await Promise.all([
    // 1. Find categories that match the query
    lowerCaseQuery
      ? db
          .select()
          .from(category)
          .where(
            and(
              eq(category.storeId, storeId),
              ilike(category.name, `%${lowerCaseQuery}%`)
            )
          )
      : Promise.resolve([]),
    // 2. Find product IDs that match by name or description
    lowerCaseQuery
      ? db
          .select({ id: product.id })
          .from(product)
          .where(
            and(
              eq(product.storeId, storeId),
              or(
                ilike(product.name, `%${lowerCaseQuery}%`),
                ilike(product.description, `%${lowerCaseQuery}%`)
              )
            )
          )
      : Promise.resolve([]),
    // 3. Find product IDs that match by tag name
    lowerCaseQuery
      ? db
          .selectDistinct({ productId: productTag.productId })
          .from(tag)
          .innerJoin(productTag, eq(tag.id, productTag.tagId))
          .where(
            and(
              eq(tag.storeId, storeId),
              ilike(tag.name, `%${lowerCaseQuery}%`)
            )
          )
      : Promise.resolve([]),
    // 4. Find product IDs for a specific tag filter
    tagId
      ? db
          .select({ productId: productTag.productId })
          .from(productTag)
          .where(eq(productTag.tagId, tagId))
      : Promise.resolve([]),
  ]);

  // Consolidate product IDs from text query (name, desc, tag name)
  let productIdsFromQuery: string[] | null = null;
  if (lowerCaseQuery) {
    const idsByName = productsByNameOrDesc.map((p) => p.id);
    const idsByTag = productsByQueryTag.map((p) => p.productId);
    productIdsFromQuery = [...new Set([...idsByName, ...idsByTag])];
  }

  // Get product IDs from the specific tag filter
  const productIdsFromTagFilter = tagId
    ? productsByTagFilter.map((p) => p.productId)
    : null;

  // Determine the final set of product IDs to use for filtering.
  // If both query and tagId are present, intersect the results.
  // Otherwise, use whichever one is present.
  let productIdsScope: string[] | null = null;
  if (productIdsFromQuery !== null && productIdsFromTagFilter !== null) {
    const tagFilterSet = new Set(productIdsFromTagFilter);
    productIdsScope = productIdsFromQuery.filter((id) => tagFilterSet.has(id));
  } else {
    productIdsScope = productIdsFromQuery ?? productIdsFromTagFilter;
  }

  // If a text query or tag filter was applied and yielded no results,
  // stop here and return no products.
  if ((lowerCaseQuery || tagId) && productIdsScope?.length === 0) {
    return { products: [], categories };
  }

  // Build the final WHERE conditions for the main product query
  const whereConditions = [eq(product.storeId, storeId)];

  if (productIdsScope) {
    //  only added if a query or tagId was provided
    whereConditions.push(inArray(product.id, productIdsScope));
  }

  if (categoryId) {
    whereConditions.push(eq(product.categoryId, categoryId));
  }

  if (typeof minPrice === "number") {
    whereConditions.push(gte(product.price, minPrice));
  }

  if (typeof maxPrice === "number") {
    whereConditions.push(lte(product.price, maxPrice));
  }

  // Only execute the final query if there are any filters applied.
  // Otherwise, return an empty array to match the original behavior for no-criteria search.
  const products =
    whereConditions.length > 1
      ? await db.query.product.findMany({
          where: and(...whereConditions),
          with: {
            images: {
              orderBy: (image, { asc }) => [asc(image.position)],
              limit: 1,
            },
            category: {
              columns: {
                name: true,
                slug: true,
              },
            },
          },
        })
      : [];

  return { products, categories };
};

export const getSearchPageStoreInfo = async (storeSlug: string) => {
  console.log("storeSlug", storeSlug);
  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
    with: {
      categories: {
        columns: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      tags: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!storeData) {
    return null;
  }

  // Find max price for the price slider
  const maxPriceResult = await db
    .select({ price: product.price })
    .from(product)
    .where(eq(product.storeId, storeData.id))
    .orderBy(desc(product.price))
    .limit(1);

  const maxPrice = maxPriceResult[0]?.price ?? 500000;

  return { ...storeData, maxPrice };
};
