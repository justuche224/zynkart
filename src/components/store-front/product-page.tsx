import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import {
  StoreDataFromHomePage,
  ProductInfoFromProductPage,
} from "@/lib/store-utils";

interface ProductDetailsPageProps {
  store: StoreDataFromHomePage;
  product: ProductInfoFromProductPage;
}

const ProductPage = ({ store, product }: ProductDetailsPageProps) => {
  const { template } = store;
  const ProductDetails = dynamic<ProductDetailsPageProps>(
    () => import(`../templates/${template}/product-page`),
    {
      loading: () => <Loader />,
    }
  );

  if (!ProductDetails) {
    return <div>Template not found</div>;
  }

  return <ProductDetails store={store} product={product} />;
};

export default ProductPage;
