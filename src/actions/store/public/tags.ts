"use server";
import db from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { product, productImage, productTag, tag } from "@/db/schema";

export const getTags = async (storeId: string) => {
  const tags = await db.query.tag.findMany({
    where: eq(tag.storeId, storeId),
  });
  return tags;
};

export const getProductsByTag = async (storeId: string, tagId: string) => {
  const products = await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      slashedFrom: product.slashedFrom,
      trackQuantity: product.trackQuantity,
      inStock: product.inStock,
      storeId: product.storeId,
      categoryId: product.categoryId,
      status: product.status,
      productSourceId: product.productSourceId,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      description: product.description,
      metaKeywords: product.metaKeywords,
      metaImage: product.metaImage,
      imageUrl: productImage.url,
      imageId: productImage.id,
      imageCreatedAt: productImage.createdAt,
      imageUpdatedAt: productImage.updatedAt,
      imageProductId: productImage.productId,
      imagePosition: productImage.position,
      imageIsDefault: productImage.isDefault,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })
    .from(productTag)
    .where(eq(productTag.tagId, tagId))
    .innerJoin(
      product,
      and(eq(productTag.productId, product.id), eq(product.storeId, storeId))
    )
    .leftJoin(
      productImage,
      and(
        eq(product.id, productImage.productId),
        eq(productImage.isDefault, true)
      )
    )
    .orderBy(desc(product.createdAt))
    .limit(5);

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    slashedFrom: p.slashedFrom,
    trackQuantity: p.trackQuantity,
    inStock: p.inStock,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    storeId: p.storeId,
    categoryId: p.categoryId,
    status: p.status,
    productSourceId: p.productSourceId,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    metaImage: p.metaImage,
    images: [
      {
        url: p.imageUrl!,
        alt: p.name,
        id: p.imageId!,
        createdAt: p.imageCreatedAt!,
        updatedAt: p.imageUpdatedAt!,
        productId: p.imageProductId!,
        position: p.imagePosition!,
        isDefault: p.imageIsDefault!,
      },
    ],
  }));
};
