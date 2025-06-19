import React from "react";
import {
  getShippingZonesForStore,
  getStoreForHomePage,
} from "@/lib/store-utils";
import Checkout from "@/components/store-front/checkout";
import { serverCustomerAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;

  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  const customer = await serverCustomerAuth();
  if (!customer) {
    return redirect(`/sign-in?callbackUrl=/checkout`);
  }

  const shippingZones = await getShippingZonesForStore(storeData.id);

  return <Checkout store={storeData} shippingZones={shippingZones} customer={customer} />;
};

export default page;
