import React from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/loader";
import { StoreDataFromHomePage } from "@/lib/store-utils";

interface AccountProps {
  store: StoreDataFromHomePage;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const Account = ({ store, user }: AccountProps) => {
  const { template } = store;

  const Account = dynamic<AccountProps>(
    () => import(`../templates/${template}/account`),
    {
      loading: () => <Loader />,
    }
  );

  if (!Account) {
    return <div>Template not found</div>;
  }

  return <Account store={store} user={user} />;
};

export default Account;
