import React from "react";
import type { Product, Store } from "../../types";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ProductsListPage = ({ store }: { store: Store }) => {
  const { template } = store;
  const ProductPage = dynamic(
    () => import(`../templates/${template}/product-list`),
    {
      loading: () => (
        <div>
          <Loader2 className="animate-spin" />
        </div>
      ),
    }
  );

  if (!ProductPage) {
    return <div>Template not found</div>;
  }

  return <ProductPage />;
};

export default ProductsListPage;
