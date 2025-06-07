"use server";

import db from "@/db";
import { eq } from "drizzle-orm";
import { category } from "@/db/schema";

export const categoryList = async ({
  storeId,
  limit = 5,
}: {
  storeId: string;
  limit?: number;
}) => {
  try {
    const categories = await db.query.category.findMany({
      where: eq(category.storeId, storeId),
      limit,
      columns: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    });
    return categories;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch categories");
  }
};
