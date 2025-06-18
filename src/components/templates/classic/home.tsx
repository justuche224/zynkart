"use client";

import type { StoreDataFromHomePage } from "@/lib/store-utils";
import Navbar from "./_components/navbar";
import { Footer } from "./_components/footer";
import { ProductWheel } from "./_components/product-wheel";
import { Banners } from "./_components/banners";
import ByCategories from "./_components/by-categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HomeProps {
  store: StoreDataFromHomePage;
}

export default function Home({ store }: HomeProps) {
  return (
    <section className="min-h-screen bg-[#fff] md:pt-16 pt-24 flex flex-col dark:bg-[#252525]">
      <Navbar
        storeSlug={store.slug}
        storeName={store.name}
        storeId={store.id}
      />
      <section className="flex-1 flex flex-col gap-10 lg:justify-between lg:min-h-[calc(100vh-5rem)]">
        {store.customisations[0].bannerSettings.show && (
          <div className="container mx-auto pt-0 md:pt-5">
            <div className="bg-transparent/50 backdrop-blur-lg">
              <Banners banners={store.banners} />
            </div>
          </div>
        )}
        {store.customisations[0].productWheelSettings.show && (
          <div className="container mx-auto">
            <ProductWheel
              storeId={store.id}
              circleTime={
                store.customisations[0].productWheelSettings.circleTime
              }
              productCount={
                store.customisations[0].productWheelSettings.productCount
              }
              categoryId={
                store.customisations[0].productWheelSettings.categoryId || "all"
              }
            />
          </div>
        )}
      </section>
      <section className="container mx-auto px-4 py-5">
        <ByCategories storeId={store.id} />
      </section>
      <section className="container mx-auto px-4 py-5 flex justify-center">
        <Button asChild>
          <Link href="/products">View All Products</Link>
        </Button>
      </section>
      <Footer storeSlug={store.slug} />
    </section>
  );
}
