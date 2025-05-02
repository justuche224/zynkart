import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const data = await serverAuth();
  if (!data?.session || !data?.user) {
    return redirect("/sign-in?callbackURL=/merchant");
  }
  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export default page;
