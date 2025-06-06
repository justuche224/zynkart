"use server";
import { UpdateCategorySchema } from "@/schemas";
import db from "@/db";
import { category, user as merchant } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";

interface UpdateCategoryInput {
  id: string;
  name: string;
  storeId: string;
  merchantId: string;
}

export const updateCategory = async (input: UpdateCategoryInput) => {
  
  const validationResult = UpdateCategorySchema.safeParse(input);
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

  const existingCategory = await db
    .select()
    .from(category)
    .where(and(eq(category.id, input.id), eq(category.storeId, input.storeId)))
    .limit(1);

  if (!existingCategory.length) {
    return {
      success: false,
      error: { message: "Category not found or doesn't belong to this store." },
      data: null,
    };
  }

  const newSlug = slugify(input.name);

  const conflictingCategory = await db
    .select()
    .from(category)
    .where(
      and(
        eq(category.storeId, input.storeId),
        eq(category.slug, newSlug),
        not(eq(category.id, input.id))
      )
    )
    .limit(1);

  if (conflictingCategory.length) {
    return {
      success: false,
      error: {
        message: `The Category name "${input.name}" is already in use.`,
      },
      data: null,
    };
  }

  try {
    const updatedCategory = await db
      .update(category)
      .set({
        name: input.name,
        slug: newSlug,
        updatedAt: new Date(),
      })
      .where(eq(category.id, input.id))
      .returning();

    if (!updatedCategory.length) {
      throw new Error("Failed to update category.");
    }

    return {
      success: true,
      error: null,
      data: { category: updatedCategory[0] },
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: { message: "Failed to update category." },
      data: null,
    };
  }
};
