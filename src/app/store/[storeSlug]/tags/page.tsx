import React from "react";
import Tags from "@/components/store-front/tags";
import { getStoreForHomePage } from "@/lib/store-utils";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;

  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }
  return <Tags store={storeData} />;
};

export default page;
