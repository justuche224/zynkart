import React from "react";
import type { Store } from "../../types";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";

const Cart = ({ store }: { store: Store }) => {
  const { template } = store;

  const CartPage = dynamic(() => import(`../templates/${template}/cart`), {
    loading: () => <Loader />,
  });

  if (!CartPage) {
    return <div>Template not found</div>;
  }

  return <CartPage />;
};

export default Cart;
