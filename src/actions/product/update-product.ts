"use server";
import { NewProductSchema } from "@/schemas";
import db from "@/db";
import {
  category,
  user,
  product,
  productImage,
  productSource,
  tag,
  productTag,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { eq, and, ne } from "drizzle-orm";
import type z from "zod";
import { serverAuth } from "@/lib/server-auth";

const MAX_FILES = 5;

export const updateProduct = async (
  productId: string,
  values: z.infer<typeof NewProductSchema>,
  merchantId: string,
  storeId: string
) => {
  try {
    const validationResult = NewProductSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: { message: validationResult.error.errors[0].message },
        data: null,
      };
    }

    if (!values?.images || values.images.length === 0) {
      return {
        success: false,
        error: { message: "At least one image is required" },
        data: null,
      };
    }
    if (values.images.length > MAX_FILES) {
      return {
        success: false,
        error: { message: `Maximum ${MAX_FILES} images allowed` },
        data: null,
      };
    }

    const session = await serverAuth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
        data: null,
      };
    }
    if (session.user.id !== merchantId) {
      return {
        success: false,
        error: { message: "Unauthorized access." },
        data: null,
      };
    }

    const merchantRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, merchantId))
      .limit(1);

    if (!merchantRecord.length) {
      return {
        success: false,
        error: { message: "Merchant not found!" },
        data: null,
      };
    }

    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);
    // TODO check if they have permission
    if (!existingProduct.length) {
      return {
        success: false,
        error: { message: "Product not found!" },
        data: null,
      };
    }

    const productSlug = slugify(values.name);

    const slugConflict = await db
      .select()
      .from(product)
      .where(and(eq(product.slug, productSlug), ne(product.id, productId)))
      .limit(1);

    if (slugConflict.length) {
      return {
        success: false,
        error: {
          message: `The Product name "${values.name}" is already in use.`,
        },
        data: null,
      };
    }

    let categoryId = values.categoryId;
    if (!categoryId && values.newCategoryName) {
      const newCategory = await db
        .insert(category)
        .values({
          name: values.newCategoryName,
          slug: slugify(values.newCategoryName),
          storeId,
        })
        .returning();

      if (!newCategory.length) {
        throw new Error("Failed to create category.");
      }
      categoryId = newCategory[0].id;
    }

    if (!categoryId) {
      return {
        success: false,
        error: { message: "Category is required." },
        data: null,
      };
    }

    let productSourceId = values.productSourceId;
    if (!productSourceId && values.newVendorName) {
      console.log("Creating new vendor with name:", values.newVendorName);
      const newVendor = await db
        .insert(productSource)
        .values({
          name: values.newVendorName,
          slug: slugify(values.newVendorName),
          storeId,
        })
        .returning();

      if (!newVendor.length) {
        throw new Error("Failed to create vendor.");
      }
      productSourceId = newVendor[0].id;
      console.log("Created new vendor with ID:", productSourceId);
    }

    if (!productSourceId) {
      return {
        success: false,
        error: { message: "Vendor is required." },
        data: null,
      };
    }

    const updatedProducts = await db
      .update(product)
      .set({
        name: values.name,
        slug: productSlug,
        description: values.description,
        status: values.status,
        categoryId: categoryId,
        price: values.price,
        slashedFrom: values.slashedFrom,
        trackQuantity: values.trackQuantity,
        inStock: values.inStock || 0,
        productSourceId: productSourceId,
        storeId,
      })
      .where(eq(product.id, productId))
      .returning();

    if (!updatedProducts.length) {
      throw new Error("Failed to update product.");
    }

    const updatedProduct = updatedProducts[0];

    // Handle product images - delete existing and add new ones
    if (values.images && values.images.length > 0) {
      // Delete existing images
      await db
        .delete(productImage)
        .where(eq(productImage.productId, productId));

      // Insert new images
      const productImages = await db
        .insert(productImage)
        .values(
          values.images.map((img) => ({
            url: img.url,
            alt: img.alt || updatedProduct.name,
            position: img.position,
            isDefault: img.isDefault,
            productId: updatedProduct.id,
          }))
        )
        .returning();

      // Add images to the product object
      (updatedProduct as any).images = productImages;
    }

    // Handle tags
    const allTagIds = [...(values.tagIds || [])];

    // Create new tags if any
    if (values.newTags && values.newTags.length > 0) {
      const newTagInserts = values.newTags.map((tagName) => ({
        name: tagName.trim(),
        slug: slugify(tagName.trim()),
        storeId,
      }));

      const insertedTags = await db
        .insert(tag)
        .values(newTagInserts)
        .returning();

      // Add new tag IDs to the list
      allTagIds.push(...insertedTags.map((t) => t.id));
    }

    // Handle product-tag relationships
    // First, delete existing product-tag relationships
    await db.delete(productTag).where(eq(productTag.productId, productId));

    // Create new product-tag relationships
    if (allTagIds.length > 0) {
      const productTagInserts = allTagIds.map((tagId) => ({
        productId: updatedProduct.id,
        tagId,
      }));

      const insertedProductTags = await db
        .insert(productTag)
        .values(productTagInserts)
        .returning();

      // Add tags to the product object
      (updatedProduct as any).tags = insertedProductTags;
    }

    // Update product variants if any
    if (values.variants && values.variants.length > 0) {
      // TODO: Implement variant update logic if needed
    }

    return {
      success: true,
      error: null,
      data: updatedProduct,
    };
  } catch (error) {
    console.error("Product update error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update product",
      },
      data: null,
    };
  }
};
