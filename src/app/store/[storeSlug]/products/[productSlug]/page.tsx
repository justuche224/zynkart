import type { Metadata } from "next";
import Product from "@/components/store-front/product-page";
import { and, eq } from "drizzle-orm";
import db from "@/db";
import { product, store } from "@/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug, productSlug } = await params;

  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      id: true,
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

  const productData = await db.query.product.findFirst({
    where: and(
      eq(product.slug, productSlug),
      eq(product.storeId, storeData.id),
      eq(product.status, "ACTIVE")
    ),
    columns: {
      name: true,
      slug: true,
      description: true,
    },
    with: {
      images: {
        columns: {
          url: true,
        },
      },
    },
  });

  if (!productData) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${productData.name} - ${storeData.name} - Online Store`,
    description:
      productData.description ||
      `Shop at ${storeData.name} for the best products and deals.`,
    keywords: [`${storeData.name}`, "online store", "shopping", "ecommerce"],
    openGraph: {
      title: `${productData.name} - ${storeData.name} - Online Store`,
      images: productData.images.map((image) => image.url),
      description:
        productData.description ||
        `Shop at ${storeData.name} for the best products and deals.`,
      url: `/${storeData.slug}`,
      siteName: storeData.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${productData.name} - ${storeData.name} - Online Store`,
      images: productData.images.map((image) => image.url),
      description:
        productData.description ||
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
  getProductInfoForProductPage,
} from "@/lib/store-utils";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) => {
  const { storeSlug, productSlug } = await params;
  const storeData = await getStoreForHomePage(storeSlug);
  const productInfo = await getProductInfoForProductPage(productSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  if (!productInfo) {
    return <div>Product not found</div>;
  }

  return <Product store={storeData} product={productInfo} />;
};

export default page;
