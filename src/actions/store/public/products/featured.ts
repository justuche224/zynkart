"use server";

import db from "@/db";
import { and, eq } from "drizzle-orm";
import { product } from "@/db/schema";

// TODO: Add a where clause to get the featured products

export async function getFeaturedProducts({
  storeId,
  limit = 5,
}: {
  storeId: string;
  limit?: number;
}) {
  const products = await db.query.product.findMany({
    where: and(eq(product.storeId, storeId), eq(product.status, "ACTIVE")),
    limit,
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.position)],
      },
    },
  });
  return products;
}
