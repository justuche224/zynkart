"use client";

import { Star, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "./_components/navbar";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { categoryList } from "@/actions/store/public/category/list";
import { useQuery } from "@tanstack/react-query";
import GenericProductList from "./_components/generic-product-list";

const LIMIT = 7;

export default function ProductsPage({
  store,
}: {
  store: StoreDataFromHomePage;
}) {
  const brands = [
    "All",
    "AudioTech",
    "GameSound",
    "FitAudio",
    "ProAudio",
    "QuietTech",
    "RetroSound",
    "ValueSound",
    "MixMaster",
  ];

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-list-navbar", store.id],
    queryFn: () => categoryList({ storeId: store.id, limit: LIMIT }),
  });

  return (
    <div className="min-h-screen dark:bg-[#1e1b4b] dark:text-white bg-white">
      <Navbar storeSlug={store.slug} storeName={store.name} />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Filter className="w-5 h-5 text-gray-500" />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <Slider
                    defaultValue={[0, 300]}
                    max={500}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {isLoading ? (
                      Array.from({ length: LIMIT }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))
                    ) : error ? (
                      <div className="text-center font-bold text-2xl text-destructive">
                        Error Loading Categories
                      </div>
                    ) : (
                      categories?.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox id={category.id} />
                          <label
                            htmlFor={category.id}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Brands</h4>
                  <div className="space-y-2">
                    {brands.slice(0, 6).map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox id={brand} />
                        <label
                          htmlFor={brand}
                          className="text-sm cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox id={`rating-${rating}`} />
                        <label
                          htmlFor={`rating-${rating}`}
                          className="flex items-center text-sm cursor-pointer"
                        >
                          <div className="flex items-center mr-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          & Up
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Explore {store.name}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Select defaultValue="featured">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button variant="ghost" size="sm" className="px-3">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="px-3">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <GenericProductList
              viewMode="grid"
              searchQuery=""
              storeId={store.id}
              categoryId="all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
