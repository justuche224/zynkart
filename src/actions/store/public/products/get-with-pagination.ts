"use server";

import db from "@/db";
import { product } from "@/db/schema";
import { ProductWithImages } from "@/types";
import { and, count, desc, eq } from "drizzle-orm";

type PaginatedResponse = {
  products: ProductWithImages[];
  totalProducts: number;
};

export const getProductsByStoreWithPagination = async ({
  storeId,
  limit = 20,
  offset = 0,
  active,
  categoryId,
}: {
  storeId: string;
  limit?: number;
  offset?: number;
  active?: boolean;
  categoryId?: string;
}): Promise<PaginatedResponse> => {
  try {
    if (!storeId) return { products: [], totalProducts: 0 };

    const conditions = [eq(product.storeId, storeId)];
    if (active) {
      conditions.push(eq(product.status, "ACTIVE"));
    }
    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
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
    throw new Error("Failed to fetch products");
  }
};

// TODO: add pagination to the response
// TODO: add sorting to the response
// TODO: add filtering to the response
// TODO: add search to the response
// TODO: add brand to the response
// TODO: add price range to the response
