import React from "react";
import type { Product } from "../../_types";

interface ProductDetailsPageProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsPageProps) => {
  return <div>ProductDetails</div>;
};

export default ProductDetails;
