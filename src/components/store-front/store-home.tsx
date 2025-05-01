import React from "react";
import type { Store } from "../../types";
import dynamic from "next/dynamic";

interface HomeProps {
  store: Store;
}

const StoreHome = ({ store }: { store: Store }) => {
  const { template } = store;

  const Home = dynamic<HomeProps>(
    () => import(`../templates/${template}/home`),
    {
      loading: () => <div>Loading…</div>,
    }
  );

  if (!Home) {
    return <div>Template not found</div>;
  }

  return <Home store={store} />;
};

export default StoreHome;
