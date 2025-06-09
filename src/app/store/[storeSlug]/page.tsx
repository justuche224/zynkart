import type { Metadata } from "next";
import StoreHome from "@/components/store-front/store-home";
import { eq } from "drizzle-orm";
import db from "@/db";
import { store } from "@/db/schema";

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
    title: `${storeData.name} - Online Store`,
    description:
      storeData.description ||
      `Shop at ${storeData.name} for the best products and deals.`,
    keywords: [`${storeData.name}`, "online store", "shopping", "ecommerce"],
    openGraph: {
      title: `${storeData.name} - Online Store`,
      description:
        storeData.description ||
        `Shop at ${storeData.name} for the best products and deals.`,
      url: `/${storeData.slug}`,
      siteName: storeData.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeData.name} - Online Store`,
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

import {
  getStoreForHomePage,
  
} from "@/lib/store-utils";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  return <StoreHome store={storeData} />;
};

export default page;
