import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

const Tags = ({ store }: { store: StoreDataFromHomePage }) => {
  const { template } = store;

  const TagsPage = dynamic<{ store: StoreDataFromHomePage }>(() => import(`../templates/${template}/tags`), {
    loading: () => <Loader />,
  });

  if (!TagsPage) {
    return <div>Template not found</div>;
  }

  return <TagsPage store={store} />;
};

export default Tags;
