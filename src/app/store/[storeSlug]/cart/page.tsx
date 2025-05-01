import React from "react";
import { Store } from "@/types";
import Cart from "@/components/store-front/cart";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const store: Store = {
    id: 1,
    name: "Store Name",
    slug: storeSlug,
    template: "default",
  };
  return <Cart store={store} />;
};

export default page;
