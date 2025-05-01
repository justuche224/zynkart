"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import productsJson from "@/products.json";
import ProductCard from "./product-card";
import ProductCardList from "./product-card-list";
import { Product } from "@/types";

interface ProductListProps {
  viewMode: "grid" | "list";
  searchQuery?: string;
}

function ProductList({ viewMode, searchQuery = "" }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(productsJson);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, index) =>
            viewMode === "grid" ? (
              <div key={index} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-32 w-32 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-4">No products found</div>
        <p className="text-sm text-muted-foreground max-w-md">
          We couldn't find any products matching your search. Try adjusting your
          filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredProducts.length}
          </span>{" "}
          products
        </p>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-4"
        }
      >
        {filteredProducts.map((product) =>
          viewMode === "grid" ? (
            <ProductCard key={product.slug} product={product} />
          ) : (
            <ProductCardList key={product.slug} product={product} />
          )
        )}
      </div>
    </div>
  );
}

export default ProductList;
