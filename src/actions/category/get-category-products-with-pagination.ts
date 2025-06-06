"use server";

import db from "@/db";
import { product } from "@/db/schema";
import { ProductWithImages } from "@/types";
import { and, count, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";

type PaginatedResponse = {
  products: ProductWithImages[];
  totalProducts: number;
};

/**
 * Get paginated products for a given category and store profile.
 *
 * @param {Object} params
 * @param {string} params.categoryId Category ID
 * @param {string} params.storeId Store ID
 * @param {number} [params.limit=20] Number of products to return
 * @param {number} [params.offset=0] Number of products to skip
 * @param {boolean} [params.active] If true, only return active products
 * @returns {Promise<PaginatedResponse>}
 */
export const getCategoryProductsWithPagination = async ({
  categoryId,
  storeId,
  limit = 20,
  offset = 0,
  active,
}: {
  categoryId: string;
  storeId: string;
  limit?: number;
  offset?: number;
  active?: boolean;
}): Promise<PaginatedResponse> => {
  try {
    if (!categoryId || !storeId)
      return { products: [], totalProducts: 0 };

    const merchant = await serverAuth();
    if (!merchant?.user) return redirect("/auth/sign-in");

    const conditions = [
      eq(product.storeId, storeId),
      eq(product.categoryId, categoryId),
    ];
    if (active) {
      conditions.push(eq(product.status, "ACTIVE"));
    }

    const totalResult = await db
      .select({ total: count(product.id) })
      .from(product)
      .where(and(...conditions));

    const totalProducts = totalResult[0]?.total ?? 0;

    const products = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: desc(product.updatedAt),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.position)],
        },
      },
    });

    return {
      products,
      totalProducts,
    };
  } catch (error) {
    console.error(error);
    return { products: [], totalProducts: 0 };
  }
};
