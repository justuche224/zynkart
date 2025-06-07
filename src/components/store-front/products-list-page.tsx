import React from "react";  
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { StoreDataFromHomePage } from "@/app/store/[storeSlug]/page";
import type { ProductListPageProps } from "@/components/templates/default/product-list";

const ProductsListPage = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;
  const ProductsList = dynamic<ProductListPageProps>(
    () => import(`../templates/${template}/product-list`),
    {
      loading: () => (
        <div>
          <Loader2 className="animate-spin" />
        </div>
      ),
    }
  );

  if (!ProductsList) {
    return <div>Template not found</div>;
  }

  return <ProductsList store={store} />;
};

export default ProductsListPage;
