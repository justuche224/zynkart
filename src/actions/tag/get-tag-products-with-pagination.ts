"use server";

import db from "@/db";
import { product, productTag } from "@/db/schema";
import { ProductWithImages } from "@/types";
import { and, count, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";

type PaginatedResponse = {
  products: ProductWithImages[];
  totalProducts: number;
};

/**
 * Get paginated products for a given tag and store.
 *
 * @param {Object} params
 * @param {string} params.tagId Tag ID
 * @param {string} params.storeId Store ID
 * @param {number} [params.limit=20] Number of products to return
 * @param {number} [params.offset=0] Number of products to skip
 * @param {boolean} [params.active] If true, only return active products
 * @returns {Promise<PaginatedResponse>}
 */
export const getTagProductsWithPagination = async ({
  tagId,
  storeId,
  limit = 20,
  offset = 0,
  active,
}: {
  tagId: string;
  storeId: string;
  limit?: number;
  offset?: number;
  active?: boolean;
}): Promise<PaginatedResponse> => {
  try {
    if (!tagId || !storeId) return { products: [], totalProducts: 0 };

    const merchant = await serverAuth();
    if (!merchant?.user) return redirect("/auth/sign-in");

    // Build the base query conditions
    const conditions = [eq(product.storeId, storeId)];
    if (active) {
      conditions.push(eq(product.status, "ACTIVE"));
    }

    // Get total count of products with this tag
    const totalResult = await db
      .select({ total: count(product.id) })
      .from(product)
      .innerJoin(productTag, eq(product.id, productTag.productId))
      .where(and(...conditions, eq(productTag.tagId, tagId)));

    const totalProducts = totalResult[0]?.total ?? 0;

    // Get paginated products with this tag
    const products = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: desc(product.updatedAt),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.position)],
        },
        tags: {
          where: eq(productTag.tagId, tagId),
          with: {
            tag: true,
          },
        },
      },
    });

    // Filter products to only include those with the specific tag
    const filteredProducts = products.filter((product) =>
      product.tags.some((pt) => pt.tagId === tagId)
    );

    return {
      products: filteredProducts,
      totalProducts,
    };
  } catch (error) {
    console.error(error);
    return { products: [], totalProducts: 0 };
  }
};
