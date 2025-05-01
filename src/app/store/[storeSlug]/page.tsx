import React from "react";
import { Store } from "@/types";
import StoreHome from "@/components/store-front/store-home";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const store: Store = {
    id: 1,
    name: "Store Name",
    slug: storeSlug,
    template: "default",
  };
  return <StoreHome store={store} />;
};

export default page;
