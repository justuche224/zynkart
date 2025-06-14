import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import {
  StoreDataFromHomePage,
  CategoryInfoFromCategoryPage,
} from "@/lib/store-utils";

interface CategoryProps {
  store: StoreDataFromHomePage;
  categoryInfo: CategoryInfoFromCategoryPage;
}

const Category = ({ store, categoryInfo }: CategoryProps) => {
  const { template } = store;

  const Category = dynamic<CategoryProps>(
    () => import(`../templates/${template}/category-page`),
    {
      loading: () => <Loader />,
    }
  );

  if (!Category) {
    return <div>Template not found</div>;
  }

  return <Category store={store} categoryInfo={categoryInfo} />;
};

export default Category;
