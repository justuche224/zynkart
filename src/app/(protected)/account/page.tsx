import Account from "@/components/account";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  if (!data?.session || !data?.user) {
    return redirect("/sign-in?callbackURL=/account");
  }

  return <Account user={data.user} currentSession={data.session} />;
};

export default page;
