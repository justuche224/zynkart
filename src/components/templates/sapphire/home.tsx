"use client";

import type { StoreDataFromHomePage } from "@/lib/store-utils";
import Hero from "./_components/hero";
import Navbar from "./_components/navbar";
import CategoriesList from "./_components/categories-list";
import { Footer } from "./_components/footer";
import Banners from "./_components/banners";
import GenericProductList from "./_components/generic-product-list";

interface HomeProps {
  store: StoreDataFromHomePage;
}

export default function Home({ store }: HomeProps) {
  console.log("customisations", store.customisations);
  console.log("hero settings", store.customisations[0].productWheelSettings);
  return (
    <div className="dark:bg-[#1e1b4b] dark:text-white bg-white">
      <div className="min-h-screen ">
        <Navbar storeSlug={store.slug} storeName={store.name} />
        {store.customisations[0].productWheelSettings.show && (
          <Hero
            storeId={store.id}
            circleTime={
              store.customisations[0].productWheelSettings.circleTime || 3
            }
            productCount={
              store.customisations[0].productWheelSettings.productCount || 6
            }
            categoryId={
              store.customisations[0].productWheelSettings.categoryId || "all"
            }
          />
        )}
        <div
          className={
            store.customisations[0].productWheelSettings.show ? "" : "pt-16"
          }
        >
          <CategoriesList storeId={store.id} />
        </div>
        {store.customisations[0].bannerSettings.show &&
          store.banners.length > 0 && <Banners banners={store.banners} />}
        <div className="container mx-auto px-4 flex flex-col gap-8 py-16">
          <h1 className="text-2xl font-bold mb-8">Top Picks</h1>
          <GenericProductList
            viewMode="grid"
            storeId={store.id}
            limit={12}
            categoryId="all"
          />
        </div>
      </div>
      <Footer storeSlug={store.slug} />
    </div>
  );
}
