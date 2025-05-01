import React from "react";
import type { Store } from "@/types";
import ProductsListPage from "@/components/store-front/products-list-page";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const store: Store = {
    id: 1,
    name: "Store Name",
    slug: storeSlug,
    template: "default",
  };

  return <ProductsListPage store={store} />;
};

export default page;
