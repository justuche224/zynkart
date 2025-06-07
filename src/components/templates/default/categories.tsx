"use client";

import { Footer } from "./_components/footer";
import { SiteHeader } from "./_components/navbar";
import type { StoreDataFromHomePage } from "@/app/store/[storeSlug]/page";
import { CategoriesFromHomePage } from "@/app/store/[storeSlug]/categories/page";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface CategoriesProps {
  store: StoreDataFromHomePage;
  categories: CategoriesFromHomePage;
}

const Categories = ({ store, categories }: CategoriesProps) => {
  return (
    <>
      <SiteHeader storeId={store.id} />
      <div className="max-w-7xl xl:mx-auto mt-20">
        <section className="container max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                href={`/categories/${category.slug}`}
                key={category.id}
              >
                <Card
                  className="group w-full h-64 relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-sidebar"
                  style={{
                    backgroundImage: category.imageUrl
                      ? `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${category.imageUrl})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <CardHeader className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <CardTitle className="text-2xl font-bold text-white">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-8 h-8 text-white" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <Footer store={store} />
      </div>
    </>
  );
};

export default Categories;
