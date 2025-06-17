"use client";

import Navbar from "./_components/navbar";
import { Footer } from "./_components/footer";
import { useQuery } from "@tanstack/react-query";
import { getSearchPageStoreInfo } from "@/actions/store/public/search";
import ProductCard from "./_components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { ResultsSkeleton, StoreSearch } from "@/components/store/search";

// Skeleton for the entire search page during initial load
const SearchPageSkeleton = () => (
  <section className="flex flex-col min-h-screen">
    <Skeleton className="h-16 w-full" />
    <section className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center gap-2 max-w-2xl mx-auto">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <div className="md:col-span-1 space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
        <div className="md:col-span-3">
          <ResultsSkeleton />
        </div>
      </div>
    </section>
    <Skeleton className="h-40 w-full" />
  </section>
);

const SearchPage = ({ store }: { store: StoreDataFromHomePage }) => {
  const { data: storeInfo, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store-search-info", store.slug],
    queryFn: () => getSearchPageStoreInfo(store.slug),
  });

  if (isLoadingStore) {
    return <SearchPageSkeleton />;
  }

  if (!storeInfo) {
    return <div>Store not found.</div>;
  }

  return <SearchPageComponent store={storeInfo} />;
};

const SearchPageComponent = ({
  store,
}: {
  store: NonNullable<Awaited<ReturnType<typeof getSearchPageStoreInfo>>>;
}) => {
  return (
    <section className="flex flex-col min-h-screen mt-16 bg-[#fff] md:pt-16 pt-24 dark:bg-[#252525]">
      <Navbar storeSlug={store.slug} storeName={store.name} storeId={store.id}  />
      <StoreSearch store={store} ProductCard={ProductCard} />
      <Footer storeSlug={store.slug} />
    </section>
  );
};

export default SearchPage;
