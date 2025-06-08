import type { Metadata } from "next";
import Categories from "@/components/store-front/category-page";
import { eq } from "drizzle-orm";
import db from "@/db";
import { banner, category, store } from "@/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { storeSlug, categorySlug } = await params;

  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      name: true,
      description: true,
      slug: true,
    },
  });

  const categoryData = await db.query.category.findFirst({
    where: eq(category.slug, categorySlug),
    columns: {
      name: true,
      slug: true,
    },
  });

  if (!storeData) {
    return {
      title: "Store Not Found",
      description: "The requested store could not be found.",
    };
  }

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${categoryData.name} - ${storeData.name} - Online Store`,
    description:
      storeData.description ||
      `Shop at ${storeData.name} for the best products and deals.`,
    keywords: [`${storeData.name}`, "online store", "shopping", "ecommerce"],
    openGraph: {
      title: `${categoryData.name} - ${storeData.name} - Online Store`,
      description:
        storeData.description ||
        `Shop at ${storeData.name} for the best products and deals.`,
      url: `/${storeData.slug}`,
      siteName: storeData.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.name} - ${storeData.name} - Online Store`,
      description:
        storeData.description ||
        `Shop at ${storeData.name} for the best products and deals.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const getStoreForHomePage = async (storeSlug: string) => {
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
    },
  });
};

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

export type StoreDataFromHomePage = NonNullable<
  Awaited<ReturnType<typeof getStoreForHomePage>>
>;
export type BannersFromHomePage = StoreDataFromHomePage["banners"];
export type CategoryInfoFromCategoryPage = NonNullable<
  Awaited<ReturnType<typeof getCategoryInfoForCategoryPage>>
>;

const page = async ({ params }: { params: Promise<{ storeSlug: string, categorySlug: string }> }) => {
  const { storeSlug, categorySlug } = await params;
  const storeData = await getStoreForHomePage(storeSlug);
  const categoryInfo = await getCategoryInfoForCategoryPage(categorySlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  if (!categoryInfo) {
    return <div>Category not found</div>;
  }


  return <Categories store={storeData} categoryInfo={categoryInfo} />;
};

export default page;
