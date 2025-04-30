import { RegisterForm } from "@/components/auth/sign-up";
import { info } from "@/constants";
import { serverAuth } from "@/lib/server-auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: `Create ${info.name} Account`,
};

const page = async () => {
  const data = await serverAuth();
  if (data?.session) {
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/—Pngtree—daily shopping cart_5398373.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default page;
