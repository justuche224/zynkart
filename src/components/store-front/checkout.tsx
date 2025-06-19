import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import {
  ShippingZonesFromStore,
  StoreDataFromHomePage,
} from "@/lib/store-utils";

const Checkout = ({
  store,
  shippingZones,
  customer,
}: {
  store: StoreDataFromHomePage;
  shippingZones: ShippingZonesFromStore;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}) => {
  const CheckoutPage = dynamic<{
    store: StoreDataFromHomePage;
    shippingZones: ShippingZonesFromStore;
    customer: {
      id: string;
      name: string;
      email: string;
    };
  }>(() => import(`../templates/classic/checkout`), {
    loading: () => <Loader />,
  });

  if (!CheckoutPage) {
    return <div>Template not found</div>;
  }

  return (
    <CheckoutPage store={store} shippingZones={shippingZones} customer={customer} />
  );
};

export default Checkout;
