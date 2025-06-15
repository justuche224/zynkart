import React from "react";
import dynamic from "next/dynamic";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import type { ProductListPageProps } from "@/components/templates/default/product-list";
import Loader from "@/components/loader";

const ProductsListPage = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;
  const ProductsList = dynamic<ProductListPageProps>(
    () => import(`../templates/${template}/product-list`),
    {
      loading: () => <Loader />,
    }
  );

  if (!ProductsList) {
    return <div>Template not found</div>;
  }

  return <ProductsList store={store} />;
};

export default ProductsListPage;
