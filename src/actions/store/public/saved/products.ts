"use server";

import { serverCustomerAuth } from "@/lib/server-auth";
import db from "@/db";
import {
  customerSavedProduct,
  product,
  productImage,
  category,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const saveProduct = async (productId: string) => {
  const customer = await serverCustomerAuth();
  if (!customer) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    // Check if product is already saved
    const existingSave = await db
      .select()
      .from(customerSavedProduct)
      .where(
        and(
          eq(customerSavedProduct.customerId, customer.id),
          eq(customerSavedProduct.productId, productId)
        )
      )
      .limit(1);

    if (existingSave.length > 0) {
      return {
        error: "Product already saved",
      };
    }

    // Save the product
    await db.insert(customerSavedProduct).values({
      customerId: customer.id,
      productId,
    });

    return {
      success: true,
      message: "Product saved successfully",
    };
  } catch (error) {
    console.error("Error saving product:", error);
    return {
      error: "Failed to save product",
    };
  }
};

export const unsaveProduct = async (productId: string) => {
  const customer = await serverCustomerAuth();
  if (!customer) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    await db
      .delete(customerSavedProduct)
      .where(
        and(
          eq(customerSavedProduct.customerId, customer.id),
          eq(customerSavedProduct.productId, productId)
        )
      );

    return {
      success: true,
      message: "Product removed from saved items",
    };
  } catch (error) {
    console.error("Error unsaving product:", error);
    return {
      error: "Failed to remove product from saved items",
    };
  }
};

export const getSavedProducts = async () => {
  const customer = await serverCustomerAuth();
  if (!customer) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const savedProducts = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        slashedFrom: product.slashedFrom,
        categoryName: category.name,
        defaultImage: productImage.url,
        savedAt: customerSavedProduct.createdAt,
        trackQuantity: product.trackQuantity,
        inStock: product.inStock,
      })
      .from(customerSavedProduct)
      .innerJoin(product, eq(customerSavedProduct.productId, product.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(
        productImage,
        and(
          eq(productImage.productId, product.id),
          eq(productImage.isDefault, true)
        )
      )
      .where(eq(customerSavedProduct.customerId, customer.id))
      .orderBy(desc(customerSavedProduct.createdAt));

    return {
      success: true,
      data: savedProducts,
    };
  } catch (error) {
    console.error("Error fetching saved products:", error);
    return {
      error: "Failed to fetch saved products",
    };
  }
};

// Check if a specific product is saved by the current customer
export const isProductSaved = async (productId: string) => {
  const customer = await serverCustomerAuth();
  if (!customer) {
    return false;
  }

  try {
    const saved = await db
      .select({ id: customerSavedProduct.id })
      .from(customerSavedProduct)
      .where(
        and(
          eq(customerSavedProduct.customerId, customer.id),
          eq(customerSavedProduct.productId, productId)
        )
      )
      .limit(1);

    return saved.length > 0;
  } catch (error) {
    console.error("Error checking if product is saved:", error);
    return false;
  }
};

// Get saved product IDs for a customer (useful for bulk checking in product lists)
export const getSavedProductIds = async () => {
  const customer = await serverCustomerAuth();
  if (!customer) {
    return [];
  }

  try {
    const savedIds = await db
      .select({ productId: customerSavedProduct.productId })
      .from(customerSavedProduct)
      .where(eq(customerSavedProduct.customerId, customer.id));

    return savedIds.map((item) => item.productId);
  } catch (error) {
    console.error("Error fetching saved product IDs:", error);
    return [];
  }
};
