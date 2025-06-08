import type { Metadata } from "next";
import Categories from "@/components/store-front/categories";
import { eq } from "drizzle-orm";
import db from "@/db";
import { banner, category, store } from "@/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      name: true,
      description: true,
      slug: true,
    },
  });

  if (!storeData) {
    return {
      title: "Store Not Found",
      description: "The requested store could not be found.",
    };
  }

  return {
    title: `Categories - ${storeData.name} - Online Store`,
    description:
      storeData.description ||
      `Shop at ${storeData.name} for the best products and deals.`,
    keywords: [`${storeData.name}`, "online store", "shopping", "ecommerce"],
    openGraph: {
      title: `Categories - ${storeData.name} - Online Store`,
      description:
        storeData.description ||
        `Shop at ${storeData.name} for the best products and deals.`,
      url: `/${storeData.slug}`,
      siteName: storeData.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Categories - ${storeData.name} - Online Store`,
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

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  const categories = await getCategoriesForHomePage(storeData.id);

  return <Categories store={storeData} categories={categories} />;
};

export default page;
