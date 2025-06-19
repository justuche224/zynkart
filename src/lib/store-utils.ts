"use server";

import { and, eq } from "drizzle-orm";
import db from "@/db";
import { banner, category, customisations, product, shippingZone, store } from "@/db/schema";

export const getStoreForHomePage = async (storeSlug: string) => {
  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      id: true,
      merchantId: true,
      address: true,
      description: true,
      email: true,
      name: true,
      phone: true,
      slug: true,
      template: true,
      logoUrl: true,
    },
    with: {
      banners: {
        columns: {
          imageUrl: true,
          linkUrl: true,
          description: true,
          id: true,
          title: true,
        },
        where: eq(banner.isActive, true),
      },
    },
  });

  if (!storeData) return null;

  const customisation = await db.query.customisations.findFirst({
    where: and(
      eq(customisations.storeId, storeData.id),
      eq(customisations.template, storeData.template)
    ),
    with: {
      productWheelSettings: true,
      bannerSettings: true,
    },
  });

  return {
    ...storeData,
    customisations: customisation ? [customisation] : [],
  };
};

const getCategoriesForHomePage = async (storeId: string) => {
  return db.query.category.findMany({
    where: eq(category.storeId, storeId),
    columns: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
  });
};

export type StoreDataFromHomePage = NonNullable<
  Awaited<ReturnType<typeof getStoreForHomePage>>
>;
export type BannersFromHomePage = StoreDataFromHomePage["banners"];
export type CategoriesFromHomePage = NonNullable<
  Awaited<ReturnType<typeof getCategoriesForHomePage>>
>;

const getCategoryInfoForCategoryPage = async (categorySlug: string) => {
  return db.query.category.findFirst({
    where: eq(category.slug, categorySlug),
    columns: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
  });
};

export type CategoryInfoFromCategoryPage = NonNullable<
  Awaited<ReturnType<typeof getCategoryInfoForCategoryPage>>
>;

const getProductInfoForProductPage = async (productSlug: string) => {
  return db.query.product.findFirst({
    where: eq(product.slug, productSlug),
    with: {
      images: {
        columns: {
          url: true,
        },
      },
    },
  });
};

export type ProductInfoFromProductPage = NonNullable<
  Awaited<ReturnType<typeof getProductInfoForProductPage>>
>;

export {
  getCategoriesForHomePage,
  getCategoryInfoForCategoryPage,
  getProductInfoForProductPage,
};

export const getShippingZonesForStore = async (storeId: string) => {
  const shippingZones = await db.query.shippingZone.findMany({
    where: eq(shippingZone.storeId, storeId),
  });

  return shippingZones;
};

export type ShippingZonesFromStore = NonNullable<
  Awaited<ReturnType<typeof getShippingZonesForStore>>
>;