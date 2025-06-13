import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

const TagPage = ({
  store,
  tag,
}: {
  store: StoreDataFromHomePage;
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}) => {
  const { template } = store;

  const TagsPage = dynamic<{
    store: StoreDataFromHomePage;
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>(() => import(`../templates/${template}/tag-page`), {
    loading: () => <Loader />,
  });

  if (!TagsPage) {
    return <div>Template not found</div>;
  }

  return <TagsPage store={store} tag={tag} />;
};

export default TagPage;
