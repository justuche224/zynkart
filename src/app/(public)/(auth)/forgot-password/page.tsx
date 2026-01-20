import { ForgotPasswordForm } from "@/components/auth/forgot-password";
import { info } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Reset you ${info.name} account password`,
};

const page = async () => {
  const { data } = await authClient.getSession();
  if (data?.session) {
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
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
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/shoper-af5Oi0kOByE-unsplash.jpg"
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
