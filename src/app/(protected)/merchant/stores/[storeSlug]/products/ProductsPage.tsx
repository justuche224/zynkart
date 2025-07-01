"use client";

import { Box, Plus, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatureLimit, useCurrentUsage } from "@/hooks/use-feature-limits";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ProductList from "./components/ProductList";
import { getStoreProductsWithPagination } from "@/actions/product/get-store-products-with-pagination";
import { useQuery } from "@tanstack/react-query";

interface ProductsPageProps {
  storeData: {
    id: string;
    name: string;
    slug: string;
  };
  merchantId: string;
}

const ITEMS_PER_PAGE = 20;

const ProductsPage = ({ storeData, merchantId }: ProductsPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { usage: currentProducts } = useCurrentUsage({
    userId: merchantId,
    featureKey: "products_count",
  });

  const {
    allowed: canCreateProduct,
    limit: productLimit,
    upgradeRequired,
  } = useFeatureLimit({
    userId: merchantId,
    featureKey: "products_count",
    requestedAmount: 1,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", storeData.id, currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      return getStoreProductsWithPagination({
        storeId: storeData.id,
        limit: ITEMS_PER_PAGE,
        offset: skip,
      });
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];
  const totalProducts = data?.totalProducts || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 my-32">
        <h3 className="text-xl font-semibold text-destructive">
          Error loading products
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading your products. Please try again later.
        </p>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 my-32">
        <Box className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">No products in your store!</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Create a product to start selling
        </p>
        <div className="flex flex-col items-center gap-4">
          {canCreateProduct ? (
            <Link
              href="products/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Product <Plus size={16} />
            </Link>
          ) : (
            <>
              <Badge variant="destructive" className="text-xs">
                Product Limit Reached
              </Badge>
              <Button
                onClick={() => window.open("/pricing", "_blank")}
                className="flex items-center gap-2"
              >
                <Crown size={16} />
                Upgrade to Add Products
              </Button>
            </>
          )}
          {productLimit && (
            <p className="text-xs text-muted-foreground">
              {productLimit === -1
                ? "Unlimited products"
                : `${currentProducts || 0}/${productLimit} products used`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {productLimit && (
        <div className="mb-6 flex items-center justify-between bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-medium">Product Usage</h3>
              <p className="text-sm text-muted-foreground">
                {productLimit === -1
                  ? `${currentProducts || 0} products created`
                  : `${currentProducts || 0} of ${productLimit} products used`}
              </p>
            </div>
            {productLimit > 0 && (
              <div className="w-32 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((currentProducts || 0) / productLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!canCreateProduct && upgradeRequired && (
              <>
                <Badge variant="destructive" className="text-xs">
                  Limit Reached
                </Badge>
                <Button
                  size="sm"
                  onClick={() => window.open("/pricing", "_blank")}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </>
            )}
            {canCreateProduct && (
              <Link href="products/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <ProductList products={products} storeData={storeData} />
      </motion.div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              // Show first page, last page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              // Show ellipsis for gaps
              if (page === 2 || page === totalPages - 1) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductsPage;
