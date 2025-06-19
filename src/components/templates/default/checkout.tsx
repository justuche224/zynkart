"use client";

import type {
  ShippingZonesFromStore,
  StoreDataFromHomePage,
} from "@/lib/store-utils";
import {SiteHeader} from "./_components/navbar";
import { Footer } from "./_components/footer";
import CheckoutPage from "@/components/store/checkout";

interface CheckoutProps {
  store: StoreDataFromHomePage;
  shippingZones: ShippingZonesFromStore;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Checkout({ store, shippingZones, customer }: CheckoutProps) {
  return (
    <section className="flex flex-col min-h-screen">
      <SiteHeader
        storeSlug={store.slug}
        storeName={store.name}
        storeId={store.id}
      />
      <CheckoutPage shippingZones={shippingZones} customer={customer} store={store} />  
      <Footer storeSlug={store.slug} />
    </section>
  );
}
