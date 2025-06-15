"use client";

import { Button } from "@/components/ui/button";
import { getSavedProductIds } from "@/actions/store/public/saved/products";
import { getProductsByStoreWithPagination } from "@/actions/store/public/products/get-with-pagination";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ProductCard from "./product-card";
import ProductCardSkeleton from "./product-card-skeleton";

interface GenericProductListProps {
  viewMode: "grid" | "list";
  searchQuery?: string;
  storeId: string;
  categoryId?: string;
  limit?: number;
}

const GenericProductList = ({
  viewMode,
  searchQuery = "",
  storeId,
  categoryId,
  limit = 20,
}: GenericProductListProps) => {
  console.log(viewMode);
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
        limit,
        categoryId,
      }),
  });

  const { data: savedProductIds, isLoading: isLoadingSavedIds } = useQuery({
    queryKey: ["savedProductIds"],
    queryFn: () => getSavedProductIds(),
    staleTime: 5 * 60 * 1000,
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
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <div className="text-center font-bold text-2xl text-destructive">
        Error Loading Products
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isSaved = savedProductIds?.includes(product.id);
          return (
            <ProductCard
              key={product.id}
              product={product}
              isInitiallySaved={isSaved}
            />
          );
        })}
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </section>
  );
};

export default GenericProductList;
