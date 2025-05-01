"use client";

import { useState } from "react";
import { Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "./_components/product-filters";
import ProductList from "./_components/product-list";
import { SiteHeader } from "./_components/navbar";

export default function ProductPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Browse our collection of high-quality products
            </p>
          </div>

          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96"></div>

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

          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-20">
                <h3 className="font-semibold mb-4 flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                <ProductFilters />
              </div>
            </div>

            <div className="flex-1">
              <ProductList viewMode={viewMode} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
