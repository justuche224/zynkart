import Account from "@/components/account";
import { serverAuth } from "@/lib/utils";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const data = await serverAuth();
  if (!data?.session || !data?.user) {
    return redirect("/sign-in?callbackURL=/account");
  }

  return <Account user={data.user} currentSession={data.session} />;
};

export default page;
