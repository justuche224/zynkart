"use client";

import type {
  ShippingZonesFromStore,
  StoreDataFromHomePage,
} from "@/lib/store-utils";
import Navbar from "./_components/navbar";
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
    <section className="min-h-screen bg-[#fff] md:pt-16 pt-24 flex flex-col dark:bg-[#252525]">
      <Navbar
        storeSlug={store.slug}
        storeName={store.name}
        storeId={store.id}
      />
      <CheckoutPage shippingZones={shippingZones} customer={customer} store={store} />  
      <Footer storeSlug={store.slug} />
    </section>
  );
}
