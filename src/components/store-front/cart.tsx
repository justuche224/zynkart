import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

const Cart = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;

  const CartPage = dynamic<{ store: StoreDataFromHomePage }>(() => import(`../templates/${template}/cart`), {
    loading: () => <Loader />,
  });

  if (!CartPage) {
    return <div>Template not found</div>;
  }

  return <CartPage store={store} />;
};

export default Cart;
