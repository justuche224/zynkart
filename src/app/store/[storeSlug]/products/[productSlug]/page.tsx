import React from "react";
import type { Store } from "@/types";
import productsJson from "@/products.json";
import ProductPage from "@/components/store-front/product-page";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) => {
  const { storeSlug, productSlug } = await params;
  const store: Store = {
    id: 1,
    name: "Store Name",
    slug: storeSlug,
    template: "default",
  };

  const product = productsJson.find((product) => product.slug === productSlug);
  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductPage store={store} product={product} />;
};

export default page;
