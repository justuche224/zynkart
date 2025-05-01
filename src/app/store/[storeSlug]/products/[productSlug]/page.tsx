import React from "react";
import type { Product, Store } from "@/types";
import ProductPage from "@/components/store-front/product-page";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const store: Store = {
    id: 1,
    name: "Store Name",
    slug: storeSlug,
    template: "default",
  };
  const product: Product = {
    id: 1,
    name: "Product Name",
    slug: "product-slug",
    description: "Product Description",
    price: 100,
    imageUrl: "https://via.placeholder.com/150",
    storeId: 1,
  };
  return <ProductPage store={store} product={product} />;
};

export default page;
