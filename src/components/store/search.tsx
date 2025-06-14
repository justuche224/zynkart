"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ComponentType, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import {
  getSearchPageStoreInfo,
  searchStore,
} from "@/actions/store/public/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SearchPageStoreInfo = NonNullable<
  Awaited<ReturnType<typeof getSearchPageStoreInfo>>
>;

type Product = NonNullable<
  Awaited<ReturnType<typeof searchStore>>
>["products"][0];

const CardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const ResultsSkeleton = () => (
  <div>
    <Skeleton className="h-6 w-1/4 mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <Skeleton className="h-6 w-1/4 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

interface StoreSearchProps {
  store: SearchPageStoreInfo;
  ProductCard: ComponentType<{ product: Product }>;
  className?: string;
}

export const StoreSearch = ({
  store,
  ProductCard,
  className,
}: StoreSearchProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || ""
  );
  const [tagId, setTagId] = useState(searchParams.get("tagId") || "");
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("maxPrice")) || store.maxPrice,
  ]);

  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedPrice] = useDebounce(priceRange, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    if (tagId) {
      params.set("tagId", tagId);
    } else {
      params.delete("tagId");
    }
    if (debouncedPrice[0] < store.maxPrice) {
      params.set("maxPrice", debouncedPrice[0].toString());
    } else {
      params.delete("maxPrice");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [
    debouncedSearch,
    categoryId,
    tagId,
    debouncedPrice,
    pathname,
    router,
    searchParams,
    store.maxPrice,
  ]);

  const finalParams = {
    storeId: store.id,
    q: searchParams.get("q"),
    categoryId: searchParams.get("categoryId"),
    tagId: searchParams.get("tagId"),
    maxPrice: searchParams.has("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "search",
      finalParams.q,
      finalParams.categoryId,
      finalParams.tagId,
      finalParams.maxPrice,
      store.id,
    ],
    queryFn: () =>
      searchStore({
        storeId: store.id,
        query: finalParams.q || undefined,
        categoryId: finalParams.categoryId || undefined,
        tagId: finalParams.tagId || undefined,
        maxPrice: finalParams.maxPrice,
      }),
    enabled:
      !!store &&
      (!!finalParams.q ||
        !!finalParams.categoryId ||
        !!finalParams.tagId ||
        finalParams.maxPrice !== undefined),
  });

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setCategoryId("");
    } else {
      setCategoryId(value);
    }
  };

  const handleTagChange = (value: string) => {
    if (value === "all") {
      setTagId("");
    } else {
      setTagId(value);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setTagId("");
    setPriceRange([store.maxPrice]);
    router.replace(pathname);
  };

  const hasActiveFilters =
    search || categoryId || tagId || priceRange[0] < store.maxPrice;

  return (
    <section className={cn("flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10", className)}>
      <div className="flex items-center gap-2 max-w-2xl mx-auto">
        <Input
          type="search"
          placeholder="Search products and categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="button" size="icon">
          <Search size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <div className="md:col-span-1 space-y-6">
          <h3 className="font-semibold text-lg">Filters</h3>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {store.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Tag</label>
            <Select value={tagId} onValueChange={handleTagChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {store.tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              Max Price: ${priceRange[0].toLocaleString()}
            </label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={store.maxPrice}
              step={100}
              className="mt-2"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={clearFilters}
            >
              <X className="mr-2" size={16} />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <ResultsSkeleton />
          ) : (
            <div>
              {data?.categories && data.categories.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/store/${store.slug}/categories/${category.slug}`}
                        className="group block"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 group-hover:opacity-75">
                          <Image
                            src={category.imageUrl || "/placeholder.svg"}
                            alt={category.name}
                            width={500}
                            height={500}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <h3 className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          {category.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                  <Separator className="my-8" />
                </div>
              )}
              {data?.products && data.products.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Products</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
              {!data?.products?.length && !data?.categories?.length && (
                <p>No results found for your search.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
