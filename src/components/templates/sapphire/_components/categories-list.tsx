"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { categoryList } from "@/actions/store/public/category/list";
import Link from "next/link";

const LIMIT = 6;

function CategoriesListSkeleton() {
  return (
    <section className="py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: LIMIT }).map((_, index) => (
            <Card key={index} className="cursor-pointer">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategoriesList({ storeId }: { storeId: string }) {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-list", storeId, LIMIT],
    queryFn: () => categoryList({ storeId, limit: LIMIT }),
  });

  if (isLoading) return <CategoriesListSkeleton />;
  if (error) return null;

  return (
    <section className="py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Top Categories
          </h2>
          <Button
            asChild
            variant="ghost"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Link href="/categories">See All →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories?.map((category, index) => (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 bg-sidebar ${
                category.imageUrl ? "bg-cover bg-center hover:scale-105" : ""
              }`}
              style={{
                backgroundImage: category.imageUrl
                  ? `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${category.imageUrl})`
                  : "none",
              }}
            >
              <Link href={`/categories/${category.slug}`}>
                <CardContent className="p-4 text-center">
                  <span className="text-sm font-medium text-white">
                    {category.name}
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
