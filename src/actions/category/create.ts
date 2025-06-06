"use server";
import { CreateCategorySchema } from "@/schemas";
import db from "@/db";
import { category, user as merchant } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";

interface CreateCategoryInput {
  name: string;
  storeId: string;
  storeProfileId?: string;
  merchantId: string;
}

export const createCategory = async (input: CreateCategoryInput) => {
  const validationResult = CreateCategorySchema.safeParse(input);
  if (!validationResult.success) {
    return {
      success: false,
      error: { message: validationResult.error.errors[0].message },
      data: null,
    };
  }

  const user = await serverAuth();
  if (!user?.user) {
    return {
      success: false,
      error: { message: "Authentication required!" },
      data: null,
    };
  }

  if (user.user.id !== input.merchantId) {
    return {
      success: false,
      error: { message: "Unauthorized access." },
      data: null,
    };
  }

  const merchantRecord = await db
    .select()
    .from(merchant)
    .where(eq(merchant.id, input.merchantId))
    .limit(1);

  if (!merchantRecord.length) {
    return {
      success: false,
      error: { message: "Merchant not found!" },
      data: null,
    };
  }

  const storeSlug = slugify(input.name);

  const existingCategory = await db
    .select()
    .from(category)
    .where(
      and(eq(category.storeId, input.storeId), eq(category.slug, storeSlug))
    )
    .limit(1);

  if (existingCategory.length) {
    return {
      success: false,
      error: { message: `The Category "${input.name}" is already in use.` },
      data: null,
    };
  }

  try {
    const newCategory = await db
      .insert(category)
      .values({
        name: input.name,
        slug: storeSlug,
        storeId: input.storeId,
      })
      .returning();

    if (!newCategory.length) {
      throw new Error("Failed to create category.");
    }

    return {
      success: true,
      error: null,
      data: { category: newCategory[0] },
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: { message: "Failed to create category." },
      data: null,
    };
  }
};
