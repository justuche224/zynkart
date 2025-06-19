import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

const Confirmed = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;

  const ConfirmedPage = dynamic<{ store: StoreDataFromHomePage }>(() => import(`../templates/${template}/confirmed`), {
    loading: () => <Loader />,
  });

  if (!ConfirmedPage) {
    return <div>Template not found</div>;
  }

  return <ConfirmedPage store={store} />;
};

export default Confirmed;
