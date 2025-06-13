"use server";

import { eq } from "drizzle-orm";
import db from "@/db";
import { banner, category, product, store } from "@/db/schema";

export const getStoreForHomePage = async (storeSlug: string) => {
  return db.query.store.findFirst({
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
      customisations: {
        with: {
          productWheelSettings: true,
          bannerSettings: true,
        },
      },
    },
  });
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
