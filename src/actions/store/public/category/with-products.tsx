"use server";

import db from "@/db";
import { eq } from "drizzle-orm";
import { category, product } from "@/db/schema";

export async function getCategoriesWithProducts(storeId: string) {
  const categories = await db.query.category.findMany({
    where: eq(category.storeId, storeId),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
    limit: 5,
    with: {
      products: {
        where: eq(product.status, "ACTIVE"),
        limit: 10,
        columns: {
          id: true,
          name: true,
          slug: true,
          price: true,
          slashedFrom: true,
        },
        with: {
          images: {
            orderBy: (images, { asc }) => [asc(images.position)],
            limit: 1,
          },
        },
      },
    },
  });

  return categories;
}
