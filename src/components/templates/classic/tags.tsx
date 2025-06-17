"use client";

import { useQuery } from "@tanstack/react-query";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { getTags } from "@/actions/store/public/tags";
import { Footer } from "./_components/footer";
import Navbar from "./_components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagsPage({ store }: { store: StoreDataFromHomePage }) {
  const {
    data: tags,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tags", store.id],
    queryFn: () => getTags(store.id),
  });


  return (
    <section className="bg-[#fff] md:pt-16 pt-24 dark:bg-[#252525]">
      <Navbar storeSlug={store.slug} storeName={store.name} storeId={store.id} />
      <div className="container mx-auto flex-1 mt-16 px-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Shop by Tags</h1>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">Failed to load tags</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tags?.map((tag) => (
                <Button asChild key={tag.id} aria-label={tag.name}>
                  <Link href={`/tags/${tag.slug}`}>{tag.name}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer storeSlug={store.slug} />
    </section>
  );
}
