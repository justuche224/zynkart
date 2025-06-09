"use client";

import { useMemo } from "react";

import { getProductsByStoreWithPagination } from "@/actions/store/public/products/get-with-pagination";
import { getSavedProductIds } from "@/actions/store/public/saved/products";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./product-card";
import ProductCardList from "./product-card-list";

interface ProductListProps {
  viewMode: "grid" | "list";
  searchQuery?: string;
  storeId: string;
  categoryId?: string;
}

function ProductList({
  viewMode,
  searchQuery = "",
  storeId,
  categoryId,
}: ProductListProps) {
  const {
    data: productData,
    isLoading: isLoadingProducts,
    error,
  } = useQuery({
    queryKey: ["products", storeId, categoryId],
    queryFn: () =>
      getProductsByStoreWithPagination({
        storeId,
        active: true,
        limit: 20,
        categoryId,
      }),
  });

  const { data: savedProductIds, isLoading: isLoadingSavedIds } = useQuery({
    queryKey: ["savedProductIds"],
    queryFn: () => getSavedProductIds(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredProducts = useMemo(() => {
    const products = productData?.products || [];

    if (searchQuery.trim() === "") {
      return products;
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productData?.products, searchQuery]);

  const isLoading = isLoadingProducts || isLoadingSavedIds;

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-destructive mb-4">Error loading products.</div>
        <p className="text-sm text-muted-foreground max-w-md">
          There was a problem fetching products. Please try again later.
        </p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-4">No products found</div>
        <p className="text-sm text-muted-foreground max-w-md">
          We couldn&apos;t find any products matching your search. Try adjusting
          your filters or search terms.
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
            <ProductCard
              key={product.slug}
              product={product}
              isInitiallySaved={savedProductIds?.includes(product.id)}
            />
          ) : (
            <ProductCardList
              key={product.slug}
              product={product}
              isInitiallySaved={savedProductIds?.includes(product.id)}
            />
          )
        )}
      </div>
    </div>
  );
}

export default ProductList;
