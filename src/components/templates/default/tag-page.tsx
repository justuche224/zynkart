"use client";

import { useQuery } from "@tanstack/react-query";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { getProductsByTag } from "@/actions/store/public/tags";
import { SiteHeader } from "./_components/navbar";
import { Footer } from "./_components/footer";
import ProductCard from "./_components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagsPage({
  store,
  tag,
}: {
  store: StoreDataFromHomePage;
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}) {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tag", store.id, tag.id],
    queryFn: () => getProductsByTag(store.id, tag.id),
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <section className="min-h-screen flex flex-col">
      <SiteHeader
        storeId={store.id}
        storeSlug={store.slug}
        storeName={store.name}
      />
      <div className="container mx-auto flex-1 mt-16 px-4">
        <h1 className="text-2xl font-bold mb-6">{tag.name}</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No products found</h2>
                <p className="text-muted-foreground">
                  There are no products available for this tag yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer storeSlug={store.slug} />
    </section>
  );
}
