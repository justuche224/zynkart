"use client";

import { useState } from "react";
import { Filter, Grid3X3, List } from "lucide-react";

import ProductWheel from "./_components/product-wheel";
import ProductList from "./_components/product-list";
import { Footer } from "./_components/footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "./_components/product-filters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SiteHeader } from "./_components/navbar";
import type { StoreDataFromHomePage } from "@/lib/store-utils";
import Banners from "./_components/banners";
import { CategoryInfoFromCategoryPage } from "@/lib/store-utils";

interface HomeProps {
  store: StoreDataFromHomePage;
  categoryInfo: CategoryInfoFromCategoryPage;
}

const Home = ({ store, categoryInfo }: HomeProps) => {
  return <Index store={store} categoryInfo={categoryInfo} />;
};

export default Home;

function Index({ store, categoryInfo }: HomeProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <>
      <SiteHeader
        storeId={store.id}
        storeSlug={store.slug}
        storeName={store.name}
      />
      <div className="max-w-7xl xl:mx-auto mt-20">
        <section className="container max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {categoryInfo.name}
            </h2>
          </div>

          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your product search with filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <ProductFilters />
                  </div>
                </SheetContent>
              </Sheet>

              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none rounded-l-md"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none rounded-r-md"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ProductList
            viewMode={viewMode}
            storeId={store.id}
            categoryId={categoryInfo.id}
          />

          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </section>
        <section className="py-8">
          {store.customisations[0].productWheelSettings.show && (
            <ProductWheel
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
          <Separator className="my-8" />
          {store.customisations[0].bannerSettings.show && (
            <Banners banners={store.banners} />
          )}
        </section>
        <Footer storeSlug={store.slug} />
      </div>
    </>
  );
}
