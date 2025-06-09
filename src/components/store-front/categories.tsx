import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import {
  StoreDataFromHomePage,
  CategoriesFromHomePage,
} from "@/lib/store-utils";

interface CategoryProps {
  store: StoreDataFromHomePage;
  categories: CategoriesFromHomePage;
}

const Categories = ({ store, categories }: CategoryProps) => {
  const { template } = store;

  const Categories = dynamic<CategoryProps>(
    () => import(`../templates/${template}/categories`),
    {
      loading: () => <Loader />,
    }
  );

  if (!Categories) {
    return <div>Template not found</div>;
  }

  return <Categories store={store} categories={categories} />;
};

export default Categories;
