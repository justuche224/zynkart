"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import type { product, productImage } from "@/db/schema";
import GenericProductList from "@/components/GenericProductList";

type Product = InferSelectModel<typeof product> & {
  images: InferSelectModel<typeof productImage>[];
};

interface ProductListProps {
  storeData: {
    id: string;
    name: string;
    slug: string;
  };
  products: Product[];
}
const ProductList = ({ products, storeData }: ProductListProps) => {
  return (
    <div className="mt-20 w-full px-5 max-w-7xl mx-auto">
      <GenericProductList
        storeId={storeData.id}
        storeSlug={storeData.slug}
        products={products}
        header={
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold mb-4">{storeData.name}</h1>
            <Link href={`/merchant/${storeData.slug}/products/new`}>
              <Button variant="outline" className="gap-2">
                <Plus size={20} />
                <span className="hidden md:inline-block">Add Product</span>
              </Button>
            </Link>
          </div>
        }
        productDetailsPath={(product) =>
          `/merchant/${storeData.slug}/products/${product.slug}`
        }
      />
    </div>
  );
};

export default ProductList;
