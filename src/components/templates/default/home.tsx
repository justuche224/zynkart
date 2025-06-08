"use client";

import { useState } from "react";
import { ArrowRight, Filter, Grid3X3, List, ShoppingBag } from "lucide-react";

// import productsJson from "@/products.json";
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
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
// import Image from "next/image";
import { SiteHeader } from "./_components/navbar";
import type { StoreDataFromHomePage } from "@/app/store/[storeSlug]/page";
import Banners from "./_components/banners";
import ByCategories from "./_components/by-category";

interface HomeProps {
  store: StoreDataFromHomePage;
}

const Home = ({ store }: HomeProps) => {
  return <Index store={store} />;
};

export default Home;

function Index({ store }: HomeProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const useProductWheel = true;
  // const newArrivals = productsJson.slice(4, 8);
  // const bestSellers = [...productsJson]
  //   .sort(() => Math.random() - 0.5)
  //   .slice(0, 4);

  return (
    <>
      <SiteHeader storeId={store.id} />
      <div className="max-w-7xl xl:mx-auto mt-20">
        {/* Hero Section */}
        {useProductWheel ? (
          <ProductWheel storeId={store.id} />
        ) : (
          <Banners banners={store.banners} />
        )}

        {/* Featured Categories */}
        <section>
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Browse our curated collection of products across various
              categories
            </p>
          </div>
          <ByCategories storeId={store.id} />
        </section>

        {/* Featured Products Carousel */}
        {!useProductWheel && (
          <section className="py-8">
            <div className="container max-w-7xl mx-auto px-4 mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Featured Products
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Discover our handpicked selection of premium products
              </p>
            </div>
            <ProductWheel storeId={store.id} />
          </section>
        )}

        {/* New Arrivals & Best Sellers */}
        {/* TODO: Add new arrivals and best sellers */}
        {/* <section className="container max-w-7xl mx-auto px-4 py-16">
          <Tabs defaultValue="new-arrivals" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <TabsList>
                <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
                <TabsTrigger value="best-sellers">Best Sellers</TabsTrigger>
              </TabsList>
              <Link
                href="/products"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
              >
                View All Products
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <TabsContent value="new-arrivals" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newArrivals.map((product) => (
                  <Card
                    key={product.slug}
                    className="border-none shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={
                            product.images[0]?.url ||
                            "/placeholder.svg?height=300&width=300"
                          }
                          alt={product.name}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-3">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <h3 className="font-medium text-sm line-clamp-1 hover:underline">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(product.price)}
                        </span>
                        {product.slashedFrom && (
                          <span className="text-xs text-muted-foreground line-through">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(product.slashedFrom)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="best-sellers" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bestSellers.map((product) => (
                  <Card
                    key={product.slug}
                    className="border-none shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={
                            product.images[0]?.url ||
                            "/placeholder.svg?height=300&width=300"
                          }
                          alt={product.name}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-3">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <h3 className="font-medium text-sm line-clamp-1 hover:underline">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(product.price)}
                        </span>
                        {product.slashedFrom && (
                          <span className="text-xs text-muted-foreground line-through">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(product.slashedFrom)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section> */}

        {/* Special Offer Banner */}
        {/* TODO: Add special offer banner (marketing banner feature) */}
        {/* <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-4">
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Limited Time Offer
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Get 20% Off Your First Purchase
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Sign up for our newsletter and receive a special discount
                    code for your first order.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                    <Input placeholder="Enter your email" type="email" />
                    <Button>Subscribe</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By subscribing, you agree to receive marketing emails from
                    us. You can unsubscribe at any time.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-video md:aspect-square rounded-lg overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src="/images/4937.jpg"
                    alt="Special Offer"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* All Products Section */}
        <section className="container max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              All Products
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Browse our complete collection of high-quality products
            </p>
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

          <ProductList viewMode={viewMode} storeId={store.id} />

          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </section>
        <Footer storeSlug={store.slug} />
      </div>
    </>
  );
}
