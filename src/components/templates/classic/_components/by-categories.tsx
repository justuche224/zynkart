"use client";

import { getCategoriesWithProducts } from "@/actions/store/public/category/with-products";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  getSavedProductIds,
  saveProduct,
  unsaveProduct,
} from "@/actions/store/public/saved/products";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AddToCart from "@/components/add-to-cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";
import formatPrice from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ByCategories({ storeId }: { storeId: string }) {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-with-products", storeId],
    queryFn: () => getCategoriesWithProducts(storeId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: savedProductIds, isLoading: isLoadingSavedIds } = useQuery({
    queryKey: ["savedProductIds"],
    queryFn: () => getSavedProductIds(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [wishlistLoading, setWishlistLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const allProducts = useMemo(() => {
    return categories?.flatMap((category) => category.products) || [];
  }, [categories]);

  useEffect(() => {
    if (savedProductIds && allProducts.length > 0) {
      const initialStatus = allProducts.reduce((acc, product) => {
        if (product) {
          acc[product.id] = savedProductIds.includes(product.id);
        }
        return acc;
      }, {} as { [key: string]: boolean });
      setSavedStatus(initialStatus);
    }
  }, [savedProductIds, allProducts]);

  const handleWishlistClick = async (productId: string) => {
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    const isCurrentlySaved = savedStatus[productId];

    try {
      if (isCurrentlySaved) {
        const result = await unsaveProduct(productId);
        if (result.success) {
          toast.success("Product removed from wishlist");
          setSavedStatus((prev) => ({ ...prev, [productId]: false }));
        } else {
          toast.error(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await saveProduct(productId);
        if (result.success) {
          toast.success("Product added to wishlist");
          setSavedStatus((prev) => ({ ...prev, [productId]: true }));
        } else {
          toast.error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const isComponentLoading = isLoading || isLoadingSavedIds;

  if (isComponentLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="w-64 flex-shrink-0">
                    <Card className="relative aspect-[1/1.25] flex flex-col justify-end">
                      <div className="p-4 pt-0">
                        <div className="mt-auto space-y-2">
                          <Skeleton className="h-5 w-4/5" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                      <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ))}
      </div>
    );
  }

  if (error || !categories || categories.length === 0) return null;

  return (
    <div className="space-y-8">
      {categories.map((category) =>
        category.products.length > 0 ? (
          <div key={category.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                {category.name}
              </h2>
              <Button variant="link">
                <Link href={`/categories/${category.slug}`}>View All</Link>
              </Button>
            </div>
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {category.products.map((product) => (
                  <div key={product.id} className="w-64 flex-shrink-0">
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all aspect-[1/1] bg-cover duration-300 relative"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${product.images[0]?.url})`,
                      }}
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        className="p-2 pb-1 flex flex-col h-full"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -top-1 -right-1 w-8 h-8 p-0 rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWishlistClick(product.id);
                          }}
                          disabled={wishlistLoading[product.id]}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              savedStatus[product.id]
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                          <span className="sr-only">Add to wishlist</span>
                        </Button>
                        <div className="mt-auto">
                          <h3 className="font-semibold text-white mb-1 md:mb-2 line-clamp-2">
                            {product.name}
                          </h3>

                          <div className="flex items-center justify-between mb-1 md:mb-4">
                            <div className="flex flex-col items-start space-x-2">
                              <span className="text-sm md:text-lg font-bold text-white">
                                {formatPrice(product.price)}
                              </span>
                              {product.slashedFrom && (
                                <span className="text-xs md:text-sm text-gray-300 line-through">
                                  {formatPrice(product.slashedFrom)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <CardFooter
                        className="px-4"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <AddToCart product={product as any} />
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ) : null
      )}
    </div>
  );
}
