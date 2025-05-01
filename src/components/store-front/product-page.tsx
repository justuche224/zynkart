import React from "react";
import type { Product, Store } from "../../types";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";

interface ProductDetailsPageProps {
  product: Product;
}

const ProductPage = ({
  product,
  store,
}: {
  product: Product;
  store: Store;
}) => {
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

  return <ProductDetails product={product} />;
};

export default ProductPage;
