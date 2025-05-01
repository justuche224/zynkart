"use client";

import { useState } from "react";
import { ArrowRight, Filter, Grid3X3, List, ShoppingBag } from "lucide-react";

import productsJson from "@/products.json";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Store } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./_components/navbar";

interface HomeProps {
  store: Store;
}

const Home = ({ store }: HomeProps) => {
  return <Index />;
};

export default Home;

function Index() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const featuredProducts = productsJson.slice(0, 4);
  const newArrivals = productsJson.slice(4, 8);
  const bestSellers = [...productsJson]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
    <>
      <SiteHeader />
      <div className="max-w-7xl xl:mx-auto mt-20">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm bg-background"
                >
                  New Season Collection
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Discover Your{" "}
                  <span className="text-primary">Perfect Style</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-md">
                  Shop the latest trends and discover premium quality products
                  at affordable prices.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/categories">Browse Categories</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src="/images/high-angle-hand-holding-cream-container.jpg"
                    alt="Hero Image"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-background rounded-lg shadow-lg p-4 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Special Offer</p>
                      <p className="text-sm text-muted-foreground">
                        Up to 50% off
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="container max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Browse our curated collection of products across various
              categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                name: "Body Creams",
                image: "2150167958.jpg",
                slug: "body-creams",
              },
              {
                name: "Perfumes",
                image: "edoardo-cuoghi-mL8CpOhZfHY-unsplash.jpg",
                slug: "perfumes",
              },
              {
                name: "Soaps and Body washes",
                image: "tarah-dane-5j6PQNwN8rs-unsplash.jpg",
                slug: "soaps-and-body-washes",
              },
              {
                name: "Hair Care",
                image: "4188870_45.jpg",
                slug: "hair-care",
              },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="relative rounded-lg overflow-hidden">
                  <div className="aspect-square">
                    <Image
                      width={300}
                      height={300}
                      src={`/images/${category.image}`}
                      alt={category.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div className="w-full">
                      <h3 className="text-white font-medium text-lg md:text-xl">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Shop Now</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section className="py-8">
          <div className="container max-w-7xl mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover our handpicked selection of premium products
            </p>
          </div>
          <ProductWheel productList={featuredProducts} />
        </section>

        {/* New Arrivals & Best Sellers */}
        <section className="container max-w-7xl mx-auto px-4 py-16">
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
        </section>

        {/* Special Offer Banner */}
        <section className="py-16">
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
        </section>

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

          <ProductList viewMode={viewMode} />

          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </section>
        <Footer
          store={{
            id: "1",
            name: "My Store",
            slug: "my-store",
            storeProfile: {
              id: "1",
              contactEmail: "mystore@me.com",
              contactPhone: "555-555-5555",
            },
          }}
        />
      </div>
    </>
  );
}
