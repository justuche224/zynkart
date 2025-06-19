import React from "react";
import { getStoreForHomePage } from "@/lib/store-utils";
import Confirmed from "@/components/store-front/confirmed";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;

  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  return <Confirmed store={storeData} />;
};

export default page;
