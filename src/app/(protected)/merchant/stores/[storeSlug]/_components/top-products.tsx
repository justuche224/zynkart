"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopProductsData } from "@/actions/dashboard/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import formatPrice from "@/lib/price-formatter";

interface TopProductsProps {
  storeId: string;
  storeSlug: string;
  days: number;
}

const TopProducts = ({ storeId, storeSlug, days }: TopProductsProps) => {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topProducts", storeId, days],
    queryFn: () => getTopProductsData(storeId, days, 5),
  });

  if (error) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Top Products
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/products`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-red-500 text-center">Error loading top products</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Top Products
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/products`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!productsData || productsData.length === 0) {
    return (
      <div className="bg-background rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Top Products
            </h3>
            <Button variant="link" asChild>
              <Link href={`/merchant/stores/${storeSlug}/products`}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-center">
            No product sales data available for this period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Top Products
          </h3>
          <Button variant="link" asChild>
            <Link href={`/merchant/stores/${storeSlug}/products`}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {productsData.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between hover:bg-muted/20 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/10 aspect-square text-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium">#{product.rank}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    <Link
                      href={`/merchant/stores/${storeSlug}/products/${product.slug}`}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.category} • {product.sales} sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formatPrice(product.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.trackQuantity
                    ? `${product.inStock} in stock`
                    : "Not tracked"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopProducts;
