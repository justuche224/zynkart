import { LoginForm } from "@/components/auth/sign-in";
import { info } from "@/constants";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import { serverAuth } from "@/lib/server-auth";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Sign into ${info.name}`,
};

const page = async () => {
  const data = await serverAuth();
  if (data?.session) {
    // console.log(data.session);
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/hero-image.png"
          alt="Image"
          width={500}
          height={500}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default page;
