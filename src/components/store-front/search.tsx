import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

const Search = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;

  const SearchPage = dynamic<{ store: StoreDataFromHomePage }>(() => import(`../templates/${template}/search`), {
    loading: () => <Loader />,
  });

  if (!SearchPage) {
    return <div>Template not found</div>;
  }

  return <SearchPage store={store} />;
};

export default Search;
