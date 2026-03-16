import { ForgotPasswordForm } from "@/components/auth/forgot-password";
import { info } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Reset your ${info.name} password`,
  description: "Reset your Zynkart account password securely.",
};

const page = async () => {
  const { data } = await authClient.getSession();
  if (data?.session) {
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="flex flex-col p-8 md:p-12 lg:p-20 relative">
        <div className="flex flex-1 items-center justify-center -translate-y-10">
          <div className="w-full max-w-[360px]">
            <Suspense
              fallback={
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="grid gap-6">
                    <div className="h-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-10 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              }
            >
              <ForgotPasswordForm />
            </Suspense>
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
              Secure
            </span>
            <p className="text-xl font-light tracking-tighter max-w-sm text-zinc-300">
              Get back to managing your professional storefront safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
