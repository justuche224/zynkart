"use client";

import { InferSelectModel } from "drizzle-orm";
import { tag } from "@/db/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTagProductsWithPagination } from "@/actions/tag/get-tag-products-with-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Box, Plus, Tag as TagIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import GenericProductList from "@/components/GenericProductList";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Tag = InferSelectModel<typeof tag>;

interface TagInfoProps {
  tag: Tag;
  storeSlug: string;
}

const ITEMS_PER_PAGE = 20;

const TagInfo = ({ tag, storeSlug }: TagInfoProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["tag-products", tag.id, currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      return getTagProductsWithPagination({
        tagId: tag.id,
        storeId: tag.storeId,
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
          There was an error loading products for this tag. Please try again
          later.
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
        <h3 className="text-xl font-semibold">No products with this tag!</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Add this tag to your products or create new products with this tag
        </p>
        <Link
          href={`/merchant/stores/${storeSlug}/products/new`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Product <Plus size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GenericProductList
        storeId={tag.storeId}
        storeSlug={storeSlug}
        products={products}
        header={
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <TagIcon className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">{tag.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <TagIcon className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
              <span className="text-muted-foreground">
                {totalProducts} {totalProducts === 1 ? "product" : "products"}
              </span>
            </div>
          </div>
        }
        productDetailsPath={(product) =>
          `/merchant/stores/${storeSlug}/products/${product.slug}`
        }
      />
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

export default TagInfo;
