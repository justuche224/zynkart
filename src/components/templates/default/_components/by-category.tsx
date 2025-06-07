import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryList } from "@/actions/store/public/category/list";

const LIMIT = 4;

function ByCategoriesSkeleton() {
  return (
    <div>
      <section className="container max-w-7xl mx-auto px-4">
        {/* <div className="flex flex-col items-center text-center mb-12">
          <div className="h-9 w-1/2 bg-muted rounded-md mb-4 animate-pulse"></div>
          <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse"></div>
        </div> */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="group">
              <div className="relative rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <div className="w-full space-y-2">
                    <div className="h-7 w-3/4 bg-gray-400/50 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const ByCategories = ({ storeId }: { storeId: string }) => {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-list", storeId, LIMIT],
    queryFn: () => categoryList({ storeId, limit: LIMIT }),
  });

  if (isLoading) return <ByCategoriesSkeleton />;

  if (error || !categories || categories.length === 0) return null;

  return (
    <div>
      <div className="container max-w-7xl mx-auto px-4">
        

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="relative rounded-lg overflow-hidden">
                <div className="aspect-square">
                  <Image
                    width={300}
                    height={300}
                    src={category.imageUrl || "/placeholder.svg"}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div className="w-full">
                    <h3 className="text-white font-medium text-lg md:text-xl">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Shop Now</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ByCategories;
