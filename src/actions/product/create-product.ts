"use server";
import { NewProductSchema } from "@/schemas";
import {
  category,
  user,
  product,
  productImage,
  productSource,
  productVariant,
  store,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import type z from "zod";
import { serverAuth } from "@/lib/server-auth";
import db from "@/db";

const MAX_FILES = 5;

export const createProduct = async (
  values: z.infer<typeof NewProductSchema>,
  merchantId: string,
  storeId: string
) => {
  try {
    // Validate input schema
    const validationResult = NewProductSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: { message: validationResult.error.errors[0].message },
        data: null,
      };
    }

    // Validate images
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

    // Validate user authentication
    const session = await serverAuth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
        data: null,
      };
    }
    if (session?.user.id !== merchantId) {
      return {
        success: false,
        error: { message: "Unauthorized access." },
        data: null,
      };
    }

    // Check if merchant exists
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

    // Generate unique slug
    const productSlug = slugify(values.name);

    // Check if product already exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(and(eq(product.slug, productSlug), eq(product.storeId, storeId)))
      .limit(1);

    if (existingProduct.length) {
      return {
        success: false,
        error: { message: `The Product "${values.name}" is already in use.` },
        data: null,
      };
    }

    // Ensure category exists
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

    // Ensure product source (vendor) exists
    let productSourceId = values.productSourceId;
    if (!productSourceId && values.newVendorName) {
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
    }

    if (!productSourceId) {
      return {
        success: false,
        error: { message: "Vendor is required." },
        data: null,
      };
    }

    // Insert the product
    const newProducts = await db
      .insert(product)
      .values({
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
      .returning();

    if (!newProducts.length) {
      throw new Error("Failed to create product.");
    }

    const newProduct = newProducts[0];

    // Insert product images
    if (values.images && values.images.length > 0) {
      const productImages = await db
        .insert(productImage)
        .values(
          values.images.map((img) => ({
            url: img.url,
            alt: img.alt || newProduct.name,
            position: img.position,
            isDefault: img.isDefault,
            productId: newProduct.id,
          }))
        )
        .returning();

      // Add images to the product object
      (newProduct as any).images = productImages;
    }

    // Insert product variants if any
    if (values.variants && values.variants.length > 0) {
      const variantInserts = values.variants.map((variant) => ({
        productId: newProduct.id,
        colorId: variant.colorId,
        sizeId: variant.sizeId,
        sku: variant.sku,
        price: variant.price,
        inStock: variant.inStock,
      }));

      const insertedVariants = await db
        .insert(productVariant)
        .values(variantInserts)
        .returning();

      // Add variants to the product object
      // console.log(insertedVariants);

      (newProduct as any).variants = insertedVariants;
    }

    return {
      success: true,
      error: null,
      data: newProduct,
    };
  } catch (error) {
    console.error("Product creation error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to create product",
      },
      data: null,
    };
  }
};
