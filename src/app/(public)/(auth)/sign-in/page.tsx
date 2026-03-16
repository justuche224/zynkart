import { LoginForm } from "@/components/auth/sign-in";
import { info } from "@/constants";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import { serverAuth } from "@/lib/server-auth";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Sign In | ${info.name} - Free Online Store Builder`,
  description: "Sign in to manage your Zynkart store, check orders, and update inventory. The easiest way to sell online in Nigeria.",
  keywords: ["sign in zynkart", "login zynkart", "nigeria online store login"],
};

const page = async () => {
  const data = await serverAuth();
  if (data?.session) {
    // console.log(data.session);
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="flex flex-col p-8 md:p-12 lg:p-20 relative">

        <div className="flex flex-1 items-center justify-center -translate-y-10">
          <div className="w-full max-w-[360px]">
            <LoginForm />
          </div>
        </div>
      </div>
      
      {/* Decorative side panel matching aesthetic */}
      <div className="relative hidden lg:block border-l border-zinc-200 dark:border-zinc-800 bg-zinc-950 overflow-hidden">
        <Image
          src="/images/shoper-af5Oi0kOByE-unsplash.jpg"
          alt="Shopping"
          fill
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30 dark:opacity-40 grayscale"
          priority
        />
        {/* Abstract typography block over the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">
          <h2 className="text-[12vw] leading-[0.8] font-bold tracking-tighter uppercase text-white/10 select-none pointer-events-none mix-blend-overlay">
            Zynkart
          </h2>
          <div className="absolute bottom-20 left-20">
            <span className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Platform Features
            </span>
            <p className="text-xl font-light tracking-tighter max-w-sm text-zinc-300">
              Stop replying to DMs manually. Manage your orders and inventory beautifully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
