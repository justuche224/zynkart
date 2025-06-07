import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/app/store/[storeSlug]/page";

interface HomeProps {
  store: StoreDataFromHomePage;
}

const StoreHome = ({ store }: HomeProps) => {
  const { template } = store;

  const Home = dynamic<HomeProps>(
    () => import(`../templates/${template}/home`),
    {
      loading: () => <Loader />,
    }
  );

  if (!Home) {
    return <div>Template not found</div>;
  }

  return <Home store={store} />;
};

export default StoreHome;
